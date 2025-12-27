# SAFE-ARCH Authentication System

## Overview
Production-ready authentication system with role-based access control (RBAC) and login audit logging.

## Current Setup (Local Development)

### Hardcoded Credentials
```
Admin Account:
- Username: admin
- Password: SafeArch2024!
- Role: Administrator (full access)
```

### User Roles

#### Admin (Developer)
- ✅ Full data access
- ✅ AI analysis enabled
- ✅ View login audit logs
- ✅ User management capabilities
- 👑 Indicated with crown emoji in UI

#### User (Data Entry)
- ✅ Data entry/collection
- ✅ View statistics
- ✅ Basic analysis
- ❌ AI analysis disabled
- ❌ No audit log access
- 👤 Indicated with user emoji in UI

## Architecture

### Components

#### `contexts/AuthContext.tsx`
- Global auth state management
- User session management
- Login history tracking
- localStorage persistence

#### `components/Login.tsx`
- Professional login form
- Form validation
- Error handling
- Demo credentials display

#### `components/AdminPanel.tsx`
- Login history viewer
- Access control summary
- Current session info
- Security notices

#### `App.tsx`
- Auth wrapper
- Conditional rendering based on role
- Header with user info and logout
- Admin tab visibility control

### Data Persistence
- **User Session**: `localStorage.getItem('safe-arch-auth')`
- **Session ID**: `localStorage.getItem('safe-arch-session-id')`
- **Login History**: `localStorage.getItem('safe-arch-login-history')`

## Login Flow

```
1. User accesses app
2. AuthProvider checks localStorage for existing session
3. If no session → Show Login component
4. User enters credentials
5. Validate against VALID_USERS
6. On success:
   - Create unique session ID
   - Add login record to history
   - Store user & session in localStorage
   - Render AppContent
7. User can view Admin Panel if role === 'admin'
```

## Logout Flow

```
1. User clicks Logout
2. Clear localStorage (auth, session)
3. Reset user state to null
4. Redirect to Login component
```

## Migration to Production Backend

### Phase 2: Backend Integration

**Step 1: Replace Mock Auth**
```typescript
// In AuthContext.tsx, replace this:
const userConfig = VALID_USERS[username as keyof typeof VALID_USERS];

// With this:
const response = await fetch('https://api.safe-arch.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const { token, user } = await response.json();
localStorage.setItem('safe-arch-token', token);
```

**Step 2: Add JWT Token Handling**
```typescript
// Store token
localStorage.setItem('safe-arch-token', jwtToken);

// Include in API requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('safe-arch-token')}`
}
```

**Step 3: Backend Requirements**
```
POST /api/auth/login
  Input: { username, password }
  Output: { token, user: { id, username, role, email } }

GET /api/auth/me
  Header: Authorization: Bearer <token>
  Output: { user, loginHistory }

POST /api/auth/logout
  Header: Authorization: Bearer <token>
  Output: { success: true }
```

**Step 4: Database Schema**
```sql
-- Users Table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Login History Table
CREATE TABLE login_history (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(255) UNIQUE,
  timestamp TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Security Considerations

### Current (Local Development)
- Credentials visible for demo purposes only
- localStorage used for session persistence
- No encryption (not suitable for production)

### For Production
- ✅ Use HTTPS only
- ✅ Implement JWT with expiration (15-30 min)
- ✅ Refresh tokens for extended sessions
- ✅ Password hashing (bcrypt/argon2)
- ✅ CSRF protection
- ✅ Rate limiting on login endpoint
- ✅ Secure HTTP-only cookies for tokens
- ✅ Monitor login history for anomalies
- ✅ Implement account lockout after failed attempts
- ✅ Require strong passwords
- ✅ Two-factor authentication (optional)

## Testing

### Test Admin Login
1. Username: `admin`
2. Password: `SafeArch2024!`
3. Should see Admin Panel tab
4. Should see login history

### Test Logout
1. Click "Logout" button
2. Should return to Login screen
3. localStorage should be cleared

### Test Session Persistence
1. Login as admin
2. Refresh page
3. Should maintain session
4. User info should persist

### Test Audit Log
1. Login multiple times
2. Open Admin Panel
3. Each login should appear in history
4. Each login should have unique session ID

## Adding New Users (Local)

Edit `contexts/AuthContext.tsx`:

```typescript
const VALID_USERS = {
  admin: { password: 'SafeArch2024!', role: 'admin', email: 'admin@safe-arch.local' },
  operator1: { password: 'Operator123!', role: 'user', email: 'operator1@safe-arch.local' },
  operator2: { password: 'Operator123!', role: 'user', email: 'operator2@safe-arch.local' },
};
```

Then rebuild and restart.

## Future Enhancements

- [ ] Password reset flow
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] OAuth2 integration (Google, OIDC)
- [ ] IP whitelisting
- [ ] Session timeout warnings
- [ ] Device fingerprinting
- [ ] Suspicious activity alerts
- [ ] GDPR compliance logging
- [ ] Automated security audits
