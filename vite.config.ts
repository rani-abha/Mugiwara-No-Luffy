import { resolve } from 'path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from "vite-plugin-glsl"
import gltf from "vite-plugin-gltf"
// https://vitejs.dev/config/

const root = resolve(__dirname, "src")
const outDir = resolve(__dirname, "builds")

export default defineConfig({
    plugins: [react(), glsl(), gltf()],
    build: {
        outDir: outDir
    },
    resolve: {
        alias: {
            "components": resolve(root, "components"),
            "types": resolve(root, "types"),
            "utils": resolve(root, "utils"),
        }
    },
})
