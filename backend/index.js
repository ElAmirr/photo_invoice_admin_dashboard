const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
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
    res.json({ status: 'ok', app: 'Shootix Unified License & Admin Server', version: '1.0.1' });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MACHINE LICENSE ROUTES (Used by the App)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Check status (trial or licensed)
app.post('/api/license/check', async (req, res) => {
    const { machineId } = req.body;
    if (!machineId) return res.status(400).json({ status: 'error', message: 'Missing machineId' });

    try {
        // 1. Check if this machine has an active license
        const licenseRes = await db.query('SELECT * FROM licenses WHERE machine_id=$1 AND is_active=1', [machineId]);
        const license = licenseRes.rows[0];
        if (license) {
            const token = createToken(machineId, 'lifetime');
            return res.json({ status: 'licensed', token, email: license.email });
        }

        // 2. Check or create trial
        const trialFetch = await db.query('SELECT * FROM trials WHERE machine_id=$1', [machineId]);
        let trial = trialFetch.rows[0];

        if (!trial) {
            await db.query('INSERT INTO trials (machine_id) VALUES ($1)', [machineId]);
            const trialCreated = await db.query('SELECT * FROM trials WHERE machine_id=$1', [machineId]);
            trial = trialCreated.rows[0];
        }

        if (trial.is_blocked) {
            return res.json({ status: 'trial_expired', daysLeft: 0 });
        }

        const startDate = new Date(trial.start_date);
        const now = new Date();
        const diffMs = now - startDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const daysLeft = Math.max(0, TRIAL_DAYS - diffDays);

        if (daysLeft <= 0) {
            await db.query('UPDATE trials SET is_blocked=1 WHERE machine_id=$1', [machineId]);
            return res.json({ status: 'trial_expired', daysLeft: 0 });
        }

        const token = createToken(machineId, 'trial');
        return res.json({ status: 'trial', daysLeft, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Activate a license key
app.post('/api/license/activate', async (req, res) => {
    const { machineId, licenseKey, email } = req.body;
    if (!machineId || !licenseKey) return res.status(400).json({ status: 'error', message: 'Missing fields' });

    try {
        const key = licenseKey.trim().toUpperCase();
        const licenseRes = await db.query('SELECT * FROM licenses WHERE key=$1', [key]);
        const license = licenseRes.rows[0];

        if (!license) return res.json({ status: 'invalid', message: 'Clé de licence invalide.' });
        if (!license.is_active) return res.json({ status: 'invalid', message: 'Cette clé a été désactivée.' });
        if (license.machine_id && license.machine_id !== machineId) {
            return res.json({ status: 'invalid', message: 'Cette clé est déjà utilisée sur un autre appareil.' });
        }

        // Bind the key to this machine
        await db.query('UPDATE licenses SET machine_id=$1, email=$2, activated_at=CURRENT_TIMESTAMP WHERE key=$3',
            [machineId, email || '', key]);

        const token = createToken(machineId, 'lifetime');
        return res.json({ status: 'licensed', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
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

// GET /admin/trials — list all trial machines
adminRouter.get('/trials', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM trials ORDER BY start_date DESC');
        const trials = result.rows;

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
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /admin/licenses — list all license keys
adminRouter.get('/licenses', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM licenses ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /admin/generate — generate N license keys
adminRouter.post('/generate', async (req, res) => {
    const { count } = req.body;
    const n = parseInt(count) || 1;
    const keys = [];

    for (let i = 0; i < n; i++) {
        const key = generateLicenseKey();
        try {
            await db.query('INSERT INTO licenses (key) VALUES ($1)', [key]);
            keys.push(key);
        } catch (e) {
            // Collision
            i--;
        }
    }

    res.json({ keys });
});

// PATCH /admin/licenses/:key/deactivate — deactivate a key
adminRouter.patch('/licenses/:key/deactivate', async (req, res) => {
    const { key } = req.params;
    try {
        const result = await db.query('UPDATE licenses SET is_active = 0 WHERE key = $1', [key]);

        if (result.rowCount > 0) {
            res.json({ success: true, message: 'License deactivated' });
        } else {
            res.status(404).json({ error: 'License key not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE /admin/trials/:machineId — reset a trial
adminRouter.delete('/trials/:machineId', async (req, res) => {
    const { machineId } = req.params;
    try {
        const result = await db.query('DELETE FROM trials WHERE machine_id = $1', [machineId]);

        if (result.rowCount > 0) {
            res.json({ success: true, message: 'Trial reset' });
        } else {
            res.status(404).json({ error: 'Trial not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Mount the admin router
app.use('/admin', adminRouter);

app.listen(PORT, () => {
    console.log(`Shootix Admin API running on port ${PORT}`);
});
