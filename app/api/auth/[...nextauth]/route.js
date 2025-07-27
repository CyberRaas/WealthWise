export const runtime = 'nodejs'  // ✅ Force Node.js

import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
