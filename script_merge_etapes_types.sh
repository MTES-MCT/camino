#!/bin/bash
set -x

for etape_type_id in $(cat packages/api/sources/etapes-types.json | jq -Mcr '.[] |.id') ; do
  echo "etape ${etape_type_id}"
  etapes_status=$(cat packages/api/sources/etapes-types--etapes-statuts.json | jq -Mcr "map(select(.etape_type_id==\"${etape_type_id}\") | {etape_statut_id: .etape_statut_id, ordre: .ordre})")

  cat packages/api/sources/etapes-types.json | jq ".[] |= if (.id == \"${etape_type_id}\") then (.etapesStatuts = ${etapes_status}) else . end" > packages/api/sources/etapes-types_2.json
  mv  packages/api/sources/etapes-types_2.json  packages/api/sources/etapes-types.json
done

