#!/bin/bash
echo "🛑 Stopping Tourify.live..."
kill 93056 2>/dev/null || true
pkill -f "next" || true
pkill -f "node.*3000" || true
echo "✅ Tourify.live stopped"
