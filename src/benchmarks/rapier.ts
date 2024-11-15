import WebAssembly from 'react-native-wasm';
global.WebAssembly = WebAssembly;
import 'text-encoding-polyfill'; // Required for `rapier3d-compat`
import RAPIER, {
  World,
  ColliderDesc,
  RigidBodyDesc,
} from '@dimforge/rapier3d-compat';


export const rapierWorldSimulation =
  (iterations: number) => async (): Promise<void> => {
    try {
      await RAPIER.init();
      const gravity = { x: 0.0, y: -9.81, z: 0.0 };
      const world = new World(gravity);

      // Create a ground plane
      const groundColliderDesc = ColliderDesc.cuboid(10.0, 0.1, 10.0);
      world.createCollider(groundColliderDesc);

      // Create a dynamic rigid-body with a cube collider
      const rigidBodyDesc = RigidBodyDesc.dynamic().setTranslation(
        0.0,
        5.0,
        0.0
      );
      const rigidBody = world.createRigidBody(rigidBodyDesc);

      const colliderDesc = ColliderDesc.cuboid(0.5, 0.5, 0.5);
      world.createCollider(colliderDesc, rigidBody);

      // Simulation loop
      const timeStep = 1 / 60;
      function simulate() {
        world.step();

        // Get the position of the cube
        const position = rigidBody.translation();
        console.log(
          `Cube position: x=${position.x.toFixed(2)}, y=${position.y.toFixed(2)}, z=${position.z.toFixed(2)}`
        );

        // Continue simulation if cube is above ground
        if (position.y > 0.5) {
          setTimeout(() => simulate(), timeStep * 1000);
        }
      }

      // Start the simulation
      simulate();
    } catch (error) {
      console.error(error);
    }
  };

