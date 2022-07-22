dev:
	ansible-playbook -i inventory_dev --ask-become-pass --vault-id camino@prompt deploy.yml
preprod:
	ansible-playbook -i inventory_preprod --ask-become-pass --vault-id camino@prompt  deploy.yml
prod:
	ansible-playbook -i inventory_prod --ask-become-pass --vault-id camino@prompt deploy.yml
edit-dev:
	ansible-vault edit --vault-id camino@prompt roles/camino/vars/dev_crypt.yml
edit-preprod:
	ansible-vault edit --vault-id camino@prompt roles/camino/vars/preprod_crypt.yml
edit-prod:
	ansible-vault edit --vault-id camino@prompt roles/camino/vars/prod_crypt.yml