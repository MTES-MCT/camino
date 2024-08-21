#/bin/bash
set -eufo pipefail
set -x

CAMINO_BUILDER_VERSION=$(sha256sum package-lock.json package.json packages/api/package.json packages/ui/package.json packages/common/package.json Dockerfile.ci Makefile | sha256sum | cut -d ' ' -f 1)
wget -O result.json https://gitlab-forge.din.developpement-durable.gouv.fr/api/graphql --header 'Content-Type: application/json' --post-data '{"query":"query getContainerRepositoryTags {containerRepository(id: \"gid://gitlab/ContainerRepository/3702\") { tags(name: \"'"${CAMINO_BUILDER_VERSION}"'\") {nodes {name}}}}","variables":null,"operationName":"getContainerRepositoryTags"}'
if cat result.json | grep "${CAMINO_BUILDER_VERSION}" > /dev/null ; then
    echo "Image tag found, skipping build and publish"
else
    echo "Image tag does not exists"
    /kaniko/executor --context "$CI_PROJECT_DIR" --cache=true --dockerfile "$CI_PROJECT_DIR/Dockerfile.ci" --destination "${CI_REGISTRY_IMAGE}/camino-builder:${CAMINO_BUILDER_VERSION}"
fi
echo "CAMINO_BUILDER_VERSION=${CAMINO_BUILDER_VERSION}" > out.env
