build:
	docker run -t --rm -w /workspace -e CARGO_HOME=/workspace/.cargo_docker -v $${PWD}/cd:/workspace rust:1.64-buster cargo build --release

dev: build
	ansible-playbook -i inventory_dev --ask-become-pass --vault-id camino@prompt deploy.yml
preprod: build
	ansible-playbook -i inventory_preprod --ask-become-pass --vault-id camino@prompt  deploy.yml
prod: build
	ansible-playbook -i inventory_prod --ask-become-pass --vault-id camino@prompt deploy.yml
edit-dev:
	ansible-vault edit --vault-id camino@prompt roles/init/vars/dev_crypt.yml
edit-preprod:
	ansible-vault edit --vault-id camino@prompt roles/init/vars/preprod_crypt.yml
edit-prod:
	ansible-vault edit --vault-id camino@prompt roles/init/vars/prod_crypt.yml