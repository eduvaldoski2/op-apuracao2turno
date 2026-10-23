#!/bin/bash
cd "$(dirname "$0")/.."
B=https://resultados.tse.jus.br/oficial/ele2026/arquivo-urna/3220/dados/ac/01066/0004/0077
H=4a6b704a7350756e6a5a496433337049453538516932486a676159553779785542752d6d765749354f41343d
curl -sS -o bu_amostra.dat "$B/$H/o03220ac0106600040077-bu.dat"
node -e "
import('./scripts/bu.mjs').then(m=>{const b=require('fs').readFileSync('bu_amostra.dat');console.log(JSON.stringify(m.decodificarBU(b,6257)))}).catch(e=>console.log('ERRO',e.stack))"
