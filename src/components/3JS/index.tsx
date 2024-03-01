// MARK: NPM Modules
// @ts-ignore
import React, { useRef, useEffect } from "react"
import styled from "styled-components"
import * as THREE from "three"
import { GUI } from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from "three/examples/jsm/Addons.js"
import { useLoader, Canvas } from '@react-three/fiber'



// MARK: Redux
// MARK: Types
import GUIThreeHexColor from "types/GUI/GUIThreeHexColor"
// MARK: Components
// MARK: Shaders
import vertexShader from "shaders/sample/vertex.glsl"
import fragmentShader from "shaders/sample/fragment.glsl"
// MARK: Functionality
// MARK: Utils

// MARK: Styled Components

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
const Scene = ({ }: Props) => {
    // MARK: Refs
    const containerRef: any = useRef(null)
    const gltf = useLoader(GLTFLoader, '../../../public/scene.gltf')
    const butterfly = useLoader(GLTFLoader, '../../../public/butterfly/scene.gltf')

    useEffect(() => {
        if (gltf) console.log("hat Model loaded!")
        if (butterfly) console.log("butterfly model loaded!")
    }, [gltf])
    // const gltf = useLoader(GLTFLoader, 'shaders/luffy_hat/scene.gltf')
    // const gltf = useLoader(GLTFLoader, 'file:///F:/Abha/threejs_spline/reactjs-3js-vitejs-starter-project/src/shaders/luffy_hat/scene.gltf')



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
            gui.destroy()
            // Remove the event listener
            window.removeEventListener("resize", onWindowResize, false)
        }
    }, [])

    // MARK: Variables
    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer()
    const camera = new THREE.PerspectiveCamera()
    const camera1 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20)

    camera1.position.set(- 1.8, 0.6, 2.7)

    // Color
    const geometryBaseColor: GUIThreeHexColor = {
        hex: "#F2BA59"
    }

    // Shader Material
    const shaderMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            color: { value: new THREE.Color(geometryBaseColor.hex) }
        }
    })

    const gui = new GUI()

    const useCreateButterfly = () => {
        const butterfly_ = butterfly.scene.clone(true)

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


    // MARK: Functionality
    const renderScene = () => {
        const controls = new OrbitControls(camera, renderer.domElement)
        const clock = new THREE.Clock()

        // Clear the Scene
        scene.clear()
        // Create a scene, camera, and renderer
        camera.fov = 75
        camera.aspect = window.innerWidth / window.innerHeight
        camera.near = 0.1
        camera.far = 1000
        // Set up the renderer
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        containerRef.current.appendChild(renderer.domElement)

        controls.addEventListener('change', render) // use if there is no animation loop
        controls.enableDamping = true
        controls.dampingFactor = 0.25
        controls.enableZoom = true
        controls.minDistance = 2
        controls.maxDistance = 10
        controls.target.set(0, 0, - 0.2)
        controls.update()

        // Create a plane that matches the camera view
        const planeGeometry = new THREE.PlaneGeometry(2, 2)
        const coneGeometry = new THREE.ConeGeometry(0.5, 1, 32)
        const plane = new THREE.Mesh(planeGeometry, shaderMaterial)
        const cone = new THREE.Mesh(coneGeometry, shaderMaterial)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        scene.background = new THREE.Color().setHSL(0.6, 0, 1)
        scene.fog = new THREE.Fog(scene.background, 1, 5000)

        // LIGHTS

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2)
        hemiLight.color.setHSL(0.6, 1, 0.6)
        hemiLight.groundColor.setHSL(0.095, 1, 0.75)
        hemiLight.position.set(0, 50, 0)
        scene.add(hemiLight)

        const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10)
        scene.add(hemiLightHelper)

        //

        const dirLight = new THREE.DirectionalLight(0xffffff, 3)
        dirLight.color.setHSL(0.1, 1, 0.95)
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


        // Add the Plane
        gltf.scene.position.set(0, 0, 0)
        gltf.scene.scale.set(1, 1.5, 1)
        // console.log("SCENEEEEEEE GRP", gltf.scene.children)
        scene.add(gltf.scene)

        // scene.add(butterfly.scene)
        // butterfly.scene.position.set(2, 0, 0)
        // butterfly.scene.scale.set(0.001, 0.001, 0.001)
        console.log("LEN::", butterflies.length)

        const amplitudeX = 5 // Amplitude in x-direction
        const amplitudeY = 2 // Amplitude in y-direction

        butterflies.forEach(butterfly => scene.add(butterfly))


        const tick = () => {
            // group.rotation.x += 0.02;
            const elapsedTime = clock.getElapsedTime()

            gltf.scene.rotation.y = 0.15 * elapsedTime


            butterflies.forEach((butterfly, index) => {

                const { x, y } = calculateInfinityMotion(elapsedTime + index * 4, (2.5 * amplitudeX) / (2 * Math.PI), amplitudeY / (0.5 * Math.PI))
                butterfly.position.set(x, y, 0)

                // Calculate direction of motion for rotation
                const dx = Math.cos(elapsedTime + index * 0.5)
                const dy = Math.sin(2 * (elapsedTime + index * 0.5))
                const direction = new THREE.Vector3(dx, dy, 0)

                // Rotate the butterfly to align with the direction of motion
                butterfly.lookAt(butterfly.position.clone().add(direction))


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

            // const frequency = 0.5 // Adjust the frequency of the motion
            // const amplitude = 2 // Adjust the amplitude of the motion

            // // Calculate the position of the butterfly along the flight path
            // const butterflyX = Math.cos(elapsedTime * frequency) * amplitude
            // const butterflyY = Math.sin(elapsedTime * frequency * 2) * amplitude * 0.5 // Adjust the frequency and amplitude for vertical motion
            // const butterflyZ = Math.sin(elapsedTime * frequency) * amplitude

            // // // Set the position of the butterfly
            // butterfly.scene.position.set(butterflyX, butterflyY, butterflyZ)

            // // Rotate the butterfly to align with the flight direction
            // butterfly.scene.rotation.y = Math.atan2(Math.cos(elapsedTime * frequency), Math.sin(elapsedTime * frequency))
            // const dx = Math.cos(elapsedTime * frequency)
            // const dy = Math.sin(elapsedTime * frequency * 2) * amplitude
            // const dz = Math.cos(elapsedTime * frequency)
            // const direction = new THREE.Vector3(dx, dy, dz)
            // const rotationMatrix = new THREE.Matrix4().makeRotationY(Math.PI / 2)
            // direction.applyMatrix4(rotationMatrix)


            // // // Rotate the butterfly to align with the direction of motion
            // butterfly.scene.lookAt(butterfly.scene.position.clone().add(direction))


            controls.update()
            renderer.render(scene, camera)
            window.requestAnimationFrame(tick)
        }
        tick()
        // Position the camera
        camera.position.z = 5
        render()

        // Animate
        animate()
    }

    function render() {

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
        renderer.clear()
        renderer.render(scene, camera)
    }

    // GUI
    const setupGUI = () => {
        const colorFolder = gui.addFolder("Color")
        // Hex Color Selector
        const color = colorFolder.addColor(geometryBaseColor, "hex")
        color.onChange((value) => {
            shaderMaterial.uniforms.color.value = new THREE.Color(value)
        })
        // R, G, B Slides
        // colorFolder.add(shaderMaterial.uniforms.color.value, "r", 0, 1, 0.1);
        // colorFolder.add(shaderMaterial.uniforms.color.value, "b", 0, 1, 0.1);
        // colorFolder.add(shaderMaterial.uniforms.color.value, "g", 0, 1, 0.1);
    }

    // MARK: Render
    return <Container ref={ containerRef } />

}

export default Scene