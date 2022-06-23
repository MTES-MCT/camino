# Architecture de l'application Camino

![architecture](media://architecture.svg)

## Ansible

Les environnements sont configurés automatiquement en utilisant ansible.
Tout se situe dans le dossier infra.

Pour pouvoir (re)-configurer un environnement, il faut :

- avoir ansible d'installé sur sa machine
- avoir accès ssh à la machine cible (dev, preprod, prod)
- avoir le mot de passe pour déchiffrer les secrets d'ansible (vault)

Pour lancer sur dev par exemple: `make dev`
Ansible va demander deux mots de passe, le sudo pour la machine, puis le mode de passe vault

Ces commandes sont idempotentes, ne pas hésiter à les relancer, ça ne doit rien changer

Pour modifier un fichier chiffré par vault, deux solutions :

```
ansible-vault edit --vault-id camino@prompt infra/roles/camino/vars/prod_crypt.yml
```

ou

```
ansible-vault decrypt --vault-id camino@prompt infra/roles/camino/vars/prod_crypt.yml
// éditer le fichier
ansible-vault encrypt --vault-id camino@prompt infra/roles/camino/vars/prod_crypt.yml
```

ATTENTION: Ne jamais commiter le fichier si il n'est plus chiffré, c'est pourquoi la première solution est la préférée, le fichier n'est jamais "en clair" sur sa machine
