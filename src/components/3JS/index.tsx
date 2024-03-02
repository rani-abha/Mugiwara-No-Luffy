// MARK: NPM Modules
// @ts-ignore
import React, { useRef, useEffect } from "react"
import styled from "styled-components"
import * as THREE from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from "three/examples/jsm/Addons.js"
import { useLoader } from '@react-three/fiber'


const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    overflow: none;
`

// MARK: React Component
// Props
interface Props { }

// Component
const Scene: React.FC<Props> = () => {
    // MARK: Refs
    const containerRef: any = useRef(null)
    const luffyHat = useLoader(GLTFLoader, '../../../public/scene.gltf')
    const butterfly = useLoader(GLTFLoader, '../../../public/butterfly/scene.gltf')
    const groundFlower = useLoader(GLTFLoader, '../../../public/grass_patch/scene.gltf')
    const textureLoader = new THREE.TextureLoader()
    const floorTexture = textureLoader.load('../../../cartoon-stone-texture/576.jpg')
    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer()
    const camera = new THREE.PerspectiveCamera()
    const camera1 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20)
    const controls = new OrbitControls(camera, renderer.domElement)
    const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(100, 100), new THREE.MeshBasicMaterial({ map: floorTexture }))

    const arrowPos = new THREE.Vector3(-2, 2, 2)
    scene.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), arrowPos, 60, 0x7F2020, 20, 10))
    scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), arrowPos, 60, 0x207F20, 20, 10))
    scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), arrowPos, 60, 0x20207F, 20, 10))


    useEffect(() => {
        if (luffyHat) console.log("hat Model loaded!")
        if (butterfly) console.log("butterfly model loaded!")
        if (groundFlower) console.log("groundFlower model loaded!")
        if (floorTexture) console.log("floorTexture  loaded!")
    }, [luffyHat])



    // MARK: State Variables
    // MARK: Use Effects

    useEffect(() => {
        // componentDidMount events
        // Render the scene
        renderScene()
        // setupGUI()

        // Add the resize listener
        window.addEventListener("resize", onWindowResize, false)

        return () => {
            // componentWillUnmount events
            // Make sure to remove the renderer from the container, to avoid ThreeJS drawing an additional canvas everytime you make changes to the code.
            containerRef.current.removeChild(renderer.domElement)
            // Remove the event listener
            window.removeEventListener("resize", onWindowResize, false)
        }
    }, [])


    camera1.position.set(- 1.8, 0.6, 2.7)

    const useCreateButterfly = () => {
        const butterfly_ = butterfly.scene.clone(true)

        // butterfly_.scale.set(0.01, 0.01, 0.01)
        butterfly_.scale.set(0.001, 0.001, 0.001)

        butterfly_.position.set(2, 0, 0)
        const initialX = Math.random() * 10 - (5 * Math.random()) // Adjust the range based on your scene size
        const initialY = Math.random() * 10 - (3 * Math.random())
        const initialZ = Math.random() * 10 - (2 * Math.random())
        console.log("INITIAL POS::", initialX, initialY, initialZ)

        butterfly_.position.set(initialX, initialY, initialZ)

        // scene.add(butterfly_)

        return butterfly_

    }

    const butterflies = Array.from({ length: 6 }, useCreateButterfly)

    function calculateInfinityMotion(t, A, B) {
        const x = A * Math.sin(t / 2)
        const y = B * Math.sin(2 * t)
        return { x, y }
    }

    const boundaryVertices = new Set()
    butterfly.scene.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry

            // Make sure that the geometry has vertex normals
            geometry.computeVertexNormals()

            const vertices = geometry.getAttribute('position').array // Access vertices
            const faces = geometry.getIndex().array // Access faces

            const edges = {} // Map to store edges and their references

            // Loop through faces to identify edges
            for (let i = 0; i < faces.length; i += 3) {
                const v1 = faces[i]
                const v2 = faces[i + 1]
                const v3 = faces[i + 2]

                // Store edges as key-value pairs in the map
                const edgesArr = [
                    [v1, v2].sort().toString(),
                    [v2, v3].sort().toString(),
                    [v3, v1].sort().toString()
                ]

                // Increment edge reference count
                edgesArr.forEach(edge => {
                    edges[edge] = (edges[edge] || 0) + 1
                })
            }

            // Check edges with only one reference (boundary edges)
            Object.keys(edges).forEach(edge => {
                if (edges[edge] === 1) {
                    edge.split(',').forEach(v => boundaryVertices.add(parseInt(v)))
                }
            })
        }

    })
    console.log('Boundary vertices:', boundaryVertices)

    const renderScene = () => {
        const clock = new THREE.Clock()
        // Clear the Scene
        scene.clear()
        setupLights()
        setupControls()

        // Create a scene, camera, and renderer
        camera.fov = 75
        camera.aspect = window.innerWidth / window.innerHeight
        camera.near = 0.1
        camera.far = 1000
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        containerRef.current.appendChild(renderer.domElement)

        scene.background = new THREE.Color().setHSL(0.6, 0.3, 0.8)
        scene.fog = new THREE.Fog(scene.background, 1, 5000)

        luffyHat.scene.position.set(0, 0, 0)
        luffyHat.scene.scale.set(0.9, 1.5, 1)
        scene.add(luffyHat.scene)

        groundFlower.scene.position.set(0, -2, 0)
        groundFlower.scene.scale.set(0.3, 0.5, 0.5)
        scene.add(groundFlower.scene)


        groundFloor.position.set(0, -2, 0)
        groundFloor.scale.set(0.04, 0.04, 0.05)
        groundFloor.rotation.set(Math.PI / 2, 0, 0)
        scene.add(groundFloor)

        scene.scale.set(0.4, 0.5, 0.4)
        // scene.scale.set(window.innerWidth / 4000, window.innerHeight / 1500, window.innerHeight / 1500)

        const amplitudeX = 5
        const amplitudeY = 2
        butterflies.forEach(butterfly => scene.add(butterfly))


        const tick = () => {
            // group.rotation.x += 0.02;
            const elapsedTime = clock.getElapsedTime()

            luffyHat.scene.rotation.y = 0.15 * elapsedTime
            groundFlower.scene.rotation.y = 0.15 * elapsedTime
            // groundFloor.rotation.z = 0.15 * elapsedTime


            butterflies.forEach((butterfly, index) => {

                const { x, y } = calculateInfinityMotion(elapsedTime + index * 4, (2.5 * amplitudeX) / (2 * Math.PI), amplitudeY / (0.5 * Math.PI))
                butterfly.position.set(x, y, 0)

                // Calculate direction of motion for rotation
                const dx = Math.cos(elapsedTime + index * 0.5)
                const dy = Math.sin(2 * (elapsedTime + index * 0.5))
                const direction = new THREE.Vector3(dx, dy, 0)
                butterflies.indexOf(butterfly) % 2 == 0 ? butterfly.rotation.set(dx, dy, dx) : butterfly.rotation.set(dx, dx, dx)

                // Rotate the butterfly to align with the direction of motion
                // butterfly.lookAt(butterfly.position.clone().add(direction))


                // const frequency = 0.5 * (1 + index) // Adjust the frequency of the motion
                // const amplitude = 2 * (index / 2)// Adjust the amplitude of the motion

                // // Calculate the position of the butterfly along the flight path
                // const butterflyX = Math.cos(elapsedTime * frequency) * amplitude
                // const butterflyY = Math.sin(elapsedTime * frequency * 2) * amplitude * 0.5 // Adjust the frequency and amplitude for vertical motion
                // const butterflyZ = Math.pow(frequency, 2)

                // // // Set the position of the butterfly
                // butterfly.position.set(butterflyX, butterflyY, butterflyZ)

                // // Rotate the butterfly to align with the flight direction
                // butterfly.rotation.y = Math.atan2(Math.cos(elapsedTime * frequency), Math.sin(elapsedTime * frequency))
                // const dx = Math.cos(elapsedTime * frequency)
                // const dy = Math.sin(elapsedTime * frequency * 2) * amplitude
                // const dz = Math.cos(elapsedTime * frequency)
                // const direction = new THREE.Vector3(dx, dy, dz)
                // const rotationMatrix = new THREE.Matrix4().makeRotationY(Math.PI / 2)
                // direction.applyMatrix4(rotationMatrix)

                // // // Rotate the butterfly to align with the direction of motion
                // butterfly.lookAt(butterfly.position.clone().add(direction))

            })
            render()
            window.requestAnimationFrame(tick)
        }
        tick()
        // Position the camera
        camera.position.z = 5
        render()

        // Animate
        animate()
    }

    const setupLights = () => {
        // LIGHTS

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2)
        hemiLight.color.setHSL(0.6, 1, 0.6)
        hemiLight.groundColor.setHSL(0.095, 1, 0.75)
        hemiLight.position.set(0, 50, 0)
        // scene.add(hemiLight)

        const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10)
        scene.add(hemiLightHelper)

        const dirLight = new THREE.DirectionalLight(0xffffff, 3)
        dirLight.color.setHSL(0.1, 0.7, 0.95)
        dirLight.position.set(- 1, 1.75, 1)
        dirLight.position.multiplyScalar(30)
        scene.add(dirLight)

        dirLight.castShadow = true

        dirLight.shadow.mapSize.width = 2048
        dirLight.shadow.mapSize.height = 2048

        const d = 50

        dirLight.shadow.camera.left = - d
        dirLight.shadow.camera.right = d
        dirLight.shadow.camera.top = d
        dirLight.shadow.camera.bottom = - d

        dirLight.shadow.camera.far = 3500
        dirLight.shadow.bias = - 0.0001

    }

    const setupControls = () => {
        controls.addEventListener('change', render)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.enableZoom = true
        controls.minDistance = 2
        controls.maxDistance = 9
        controls.target.set(0, 0, - 0.2)
        controls.update()
    }

    const render = () => {

        renderer.render(scene, camera)

    }

    // When the window resizes adapt the scene
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }

    // Create an animation loop
    const animate = () => {
        requestAnimationFrame(animate)
        controls.update()
        renderer.clear()
        renderer.render(scene, camera)
    }


    // MARK: Render
    return <Container ref={ containerRef } />

}

export default Scene