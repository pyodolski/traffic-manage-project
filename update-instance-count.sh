#!/bin/bash

# 주기적으로 인스턴스 개수를 업데이트하는 스크립트
# systemd 타이머나 cron으로 실행

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
COUNT=$($SCRIPT_DIR/get-instance-count.sh)

# .env 파일 업데이트
if [ -f "$SCRIPT_DIR/.env" ]; then
  # INSTANCE_COUNT가 이미 있으면 업데이트, 없으면 추가
  if grep -q "^INSTANCE_COUNT=" "$SCRIPT_DIR/.env"; then
    sed -i "s/^INSTANCE_COUNT=.*/INSTANCE_COUNT=$COUNT/" "$SCRIPT_DIR/.env"
  else
    echo "INSTANCE_COUNT=$COUNT" >> "$SCRIPT_DIR/.env"
  fi
else
  echo "INSTANCE_COUNT=$COUNT" > "$SCRIPT_DIR/.env"
fi

# Node.js 앱 재시작 (systemd 사용 시)
# systemctl restart football-app 2>/dev/null || true
