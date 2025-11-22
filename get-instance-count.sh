#!/bin/bash

# GCP 인스턴스 그룹의 인스턴스 개수를 가져오는 스크립트
# 이 스크립트는 각 VM 인스턴스에서 실행되어 현재 인스턴스 그룹의 크기를 확인합니다

# 메타데이터에서 프로젝트 ID와 영역 가져오기
PROJECT_ID=$(curl -s "http://metadata.google.internal/computeMetadata/v1/project/project-id" -H "Metadata-Flavor: Google")
ZONE=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/zone" -H "Metadata-Flavor: Google" | cut -d'/' -f4)
INSTANCE_NAME=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/name" -H "Metadata-Flavor: Google")

# 인스턴스 그룹 이름 추출 (예: football-app-group-v2-1kxm -> football-app-group-v2)
INSTANCE_GROUP=$(echo $INSTANCE_NAME | sed 's/-[^-]*$//')

# gcloud를 사용하여 인스턴스 그룹의 크기 가져오기
INSTANCE_COUNT=$(gcloud compute instance-groups managed list-instances $INSTANCE_GROUP \
  --zone=$ZONE \
  --format="value(name)" 2>/dev/null | wc -l)

# 결과가 없으면 기본값 설정
if [ -z "$INSTANCE_COUNT" ] || [ "$INSTANCE_COUNT" -eq 0 ]; then
  INSTANCE_COUNT="N/A"
fi

echo $INSTANCE_COUNT
