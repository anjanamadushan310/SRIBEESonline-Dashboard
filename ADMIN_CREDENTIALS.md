# SRIBEESonline - Admin Portal Credentials

> **Document Status**: Demo/Development Credentials  
> **Last Updated**: February 2026  
> **⚠️ WARNING**: These are development credentials. Change all passwords before production deployment!

---



### Demo User Accounts

| Email | Password | Role | Branch Access | Description |
|-------|----------|------|---------------|-------------|
| `superadmin@sribeesonline.lk` | `Admin@123` | Super Admin | All Branches | Full system access |
| `manager.colombo@sribeesonline.lk` | `Admin@123` | Branch Manager | Colombo | Colombo branch management |
| `manager.kandy@sribeesonline.lk` | `Admin@123` | Branch Manager | Kandy | Kandy branch management |
| `manager.galle@sribeesonline.lk` | `Admin@123` | Branch Manager | Galle | Galle branch management |
| `staff1.colombo@sribeesonline.lk` | `Admin@123` | Staff | Colombo | Basic staff operations |
| `inventory@sribeesonline.lk` | `Admin@123` | Inventory | All Branches | Stock management |
| `support@sribeesonline.lk` | `Admin@123` | Support | All Branches | Customer support (read-only) |

---

## 👤 Role Permissions Summary

| Role | Products | Orders | Inventory | Analytics | Users | Settings |
|------|:--------:|:------:|:---------:|:---------:|:-----:|:--------:|
| **Super Admin** | Full CRUD | Full CRUD | Full CRUD | ✅ Global | ✅ Manage | ✅ Full |
| **Branch Manager** | View/Update | View/Update | View/Update | ✅ Branch | ❌ | Branch Only |
| **Staff** | View | View/Process | View | ❌ | ❌ | ❌ |
| **Support** | View | View/Update | View | ❌ | ❌ | ❌ |
| **Inventory** | View/Update | ❌ | Full CRUD | ✅ Stock | ❌ | ❌ |

---

## 🏪 Branch Information

| Branch Code | Branch Name | City | Manager |
|-------------|-------------|------|---------|
| `CMB` | Colombo Main | Colombo | manager.colombo@sribeesonline.lk |
| `KDY` | Kandy Central | Kandy | manager.kandy@sribeesonline.lk |
| `GLE` | Galle Fort | Galle | manager.galle@sribeesonline.lk |

---

## 🚀 Quick Start

1. **Start the FastAPI backend server**:
   ```bash
   cd fastapi_backend
   uvicorn app.main:app --reload --port 8000
   ```

2. **Start the admin dashboard**:
   ```bash
   cd admin
   npm run dev
   ```

3. **Login** at `http://localhost:5173/login` with any of the credentials above.

---

## 🔄 Resetting Demo Data

To reset all demo data including admin users and branches:

```bash
cd fastapi_backend

# Run all migrations (Alembic)
alembic upgrade head

# Seed admin system (branches, users, inventory)
python -m app.utils.seed_admin_system
```

---

## ⚠️ Security Notes

- **Default Password**: All demo accounts use `Admin@123`
- **Password Requirements**: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
- **Session Duration**: 7 days (30 days with "Remember Me")
- **Rate Limiting**: 5 login attempts per 15 minutes

---

*For production deployment, ensure all default credentials are changed and proper security measures are in place.*
