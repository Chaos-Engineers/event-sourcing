from node:current-buster-slim
workdir work
copy package* /work/
run npm i
run npm i -g serve
copy public/ /work/public/
copy src/ /work/src/
run npm start build
cmd ["serve","-s","build"]

