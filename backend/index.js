const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // Added
require('dotenv').config();

const db = require('./database');
const authMiddleware = require('./authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
const JWT_SECRET = process.env.JWT_SECRET || 'SHOOTIX_SECRET_CHANGE_THIS_IN_PRODUCTION';
const TRIAL_DAYS = parseInt(process.env.TRIAL_DAYS) || 5;
const PORT = process.env.PORT || 3334;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'shootix-admin-2026';
const ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN || 'shootix-admin-session-token-v1';

// Helper: generate a license key
function generateLicenseKey() {
    const part = () => crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${part()}-${part()}-${part()}-${part()}`;
}

// Helper: create a signed token
function createToken(machineId, type) {
    return jwt.sign(
        { machineId, type, iss: 'shootix' },
        JWT_SECRET,
        // For trial tokens, expire after TRIAL_DAYS. For lifetime, no expiry.
        type === 'trial' ? { expiresIn: `${TRIAL_DAYS}d` } : {}
    );
}

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', app: 'Shootix License Server', version: '1.0.0' });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MACHINE LICENSE ROUTES (Used by the App)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Check status (trial or licensed)
app.post('/api/license/check', (req, res) => {
    const { machineId } = req.body;
    if (!machineId) return res.status(400).json({ status: 'error', message: 'Missing machineId' });

    // 1. Check if this machine has an active license
    const license = db.prepare('SELECT * FROM licenses WHERE machine_id=? AND is_active=1').get(machineId);
    if (license) {
        const token = createToken(machineId, 'lifetime');
        return res.json({ status: 'licensed', token, email: license.email });
    }

    // 2. Check or create trial
    let trial = db.prepare('SELECT * FROM trials WHERE machine_id=?').get(machineId);
    if (!trial) {
        db.prepare('INSERT INTO trials (machine_id) VALUES (?)').run(machineId);
        trial = db.prepare('SELECT * FROM trials WHERE machine_id=?').get(machineId);
    }

    if (trial.is_blocked) {
        return res.json({ status: 'trial_expired', daysLeft: 0 });
    }

    const startDate = new Date(trial.start_date);
    const now = new Date();
    const diffMs = now - startDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysLeft = TRIAL_DAYS - diffDays;

    if (daysLeft <= 0) {
        db.prepare('UPDATE trials SET is_blocked=1 WHERE machine_id=?').run(machineId);
        return res.json({ status: 'trial_expired', daysLeft: 0 });
    }

    const token = createToken(machineId, 'trial');
    return res.json({ status: 'trial', daysLeft, token });
});

// Activate a license key
app.post('/api/license/activate', (req, res) => {
    const { machineId, licenseKey, email } = req.body;
    if (!machineId || !licenseKey) return res.status(400).json({ status: 'error', message: 'Missing fields' });

    const license = db.prepare('SELECT * FROM licenses WHERE key=?').get(licenseKey.trim().toUpperCase());

    if (!license) return res.json({ status: 'invalid', message: 'Clé de licence invalide.' });
    if (!license.is_active) return res.json({ status: 'invalid', message: 'Cette clé a été désactivée.' });
    if (license.machine_id && license.machine_id !== machineId) {
        return res.json({ status: 'invalid', message: 'Cette clé est déjà utilisée sur un autre appareil.' });
    }

    // Bind the key to this machine
    db.prepare('UPDATE licenses SET machine_id=?, email=?, activated_at=CURRENT_TIMESTAMP WHERE key=?')
        .run(machineId, email || '', licenseKey.trim().toUpperCase());

    const token = createToken(machineId, 'lifetime');
    return res.json({ status: 'licensed', token });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUBLIC ADMIN ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// POST /admin/login — accepts { password }, returns a session token
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        return res.json({ token: ADMIN_SESSION_TOKEN });
    }
    return res.status(401).json({ error: 'Invalid password' });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROTECTED ADMIN ROUTES (Used by Dashboard)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const adminRouter = express.Router();
adminRouter.use(authMiddleware);

// GET /admin/trials — list all trial machines (machineId, start_date, days_left, is_blocked)
adminRouter.get('/trials', (req, res) => {
    const trials = db.prepare('SELECT * FROM trials ORDER BY start_date DESC').all();

    // Calculate days left (assumed 5 days trial)
    const TRIAL_DAYS = 5;
    const enrichedTrials = trials.map(t => {
        const startDate = new Date(t.start_date);
        const now = new Date();
        const diffMs = now - startDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const daysLeft = Math.max(0, TRIAL_DAYS - diffDays);

        return {
            ...t,
            days_left: daysLeft
        };
    });

    res.json(enrichedTrials);
});

// GET /admin/licenses — list all license keys (key, email, machine_id, activated_at, is_active)
adminRouter.get('/licenses', (req, res) => {
    const licenses = db.prepare('SELECT * FROM licenses ORDER BY created_at DESC').all();
    res.json(licenses);
});

// POST /admin/generate — generate N license keys { count: N }, returns the keys
adminRouter.post('/generate', (req, res) => {
    const { count } = req.body;
    const n = parseInt(count) || 1;
    const keys = [];

    const insert = db.prepare('INSERT INTO licenses (key) VALUES (?)');

    for (let i = 0; i < n; i++) {
        const key = generateLicenseKey();
        try {
            insert.run(key);
            keys.push(key);
        } catch (e) {
            // Collision, unlikely with 8 bytes of entropy but possible
            i--;
        }
    }

    res.json({ keys });
});

// PATCH /admin/licenses/:key/deactivate — deactivate a key
adminRouter.patch('/licenses/:key/deactivate', (req, res) => {
    const { key } = req.params;
    const result = db.prepare('UPDATE licenses SET is_active = 0 WHERE key = ?').run(key);

    if (result.changes > 0) {
        res.json({ success: true, message: 'License deactivated' });
    } else {
        res.status(404).json({ error: 'License key not found' });
    }
});

// DELETE /admin/trials/:machineId — reset a trial (useful for customer support)
adminRouter.delete('/trials/:machineId', (req, res) => {
    const { machineId } = req.params;
    const result = db.prepare('DELETE FROM trials WHERE machine_id = ?').run(machineId);

    if (result.changes > 0) {
        res.json({ success: true, message: 'Trial reset' });
    } else {
        res.status(404).json({ error: 'Trial not found' });
    }
});

// Mount the admin router
app.use('/admin', adminRouter);

app.listen(PORT, () => {
    console.log(`Shootix Admin API running on http://localhost:${PORT}`);
});
