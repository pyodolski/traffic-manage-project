#!/bin/bash

# VM 인스턴스에서 실행할 설정 스크립트
# 이 스크립트는 인스턴스 개수 모니터링을 설정합니다

echo "🔧 인스턴스 모니터링 설정 중..."

# 현재 디렉토리
APP_DIR="/home/pjwp0928w/football-ticketing-system"

# 스크립트 실행 권한 부여
chmod +x $APP_DIR/get-instance-count.sh
chmod +x $APP_DIR/update-instance-count.sh

# 초기 인스턴스 개수 설정
$APP_DIR/update-instance-count.sh

# cron job 추가 (1분마다 업데이트)
CRON_JOB="* * * * * $APP_DIR/update-instance-count.sh"

# 기존 cron job 확인 및 추가
(crontab -l 2>/dev/null | grep -v "update-instance-count.sh"; echo "$CRON_JOB") | crontab -

echo "✅ 인스턴스 모니터링 설정 완료!"
echo "📊 현재 인스턴스 개수: $(cat $APP_DIR/.env | grep INSTANCE_COUNT | cut -d'=' -f2)"
