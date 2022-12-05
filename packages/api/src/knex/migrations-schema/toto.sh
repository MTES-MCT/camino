import {Knex} from "knex" for file in *.js; do 
    mv -- "$file" "${file%.js}.ts"
done
