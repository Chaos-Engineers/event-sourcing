from node:current-buster-slim
workdir work
copy package* /work/
run npm i
copy src/ /work/src/
cmd ["npm","start"]
