dev:
	ansible-playbook -i inventory_dev --ask-become-pass deploy.yml
preprod:
	ansible-playbook -i inventory_preprod --ask-become-pass deploy.yml
prod:
	ansible-playbook -i inventory_prod --ask-become-pass --vault-id prod@prompt deploy.yml