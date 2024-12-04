import {register} from '@callstack/polygen';
register();
import 'text-encoding-polyfill'; // Required for `rapier3d-compat`
import RAPIER, {
  World,
  ColliderDesc,
  RigidBodyDesc,
} from '@dimforge/rapier3d-compat';


export const rapierWorldSimulation =
(iterations: number) => async (): Promise<void> => {
  await RAPIER.init();

  for (let i = 0; i < iterations; i++) {
    console.log(`Iteration ${i + 1}/${iterations}`);

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

    // Run simulation until cube reaches ground
    while (rigidBody.translation().y > 0.5) {
      world.step();
      const position = rigidBody.translation();
      console.log(
        `Cube position: x=${position.x.toFixed(2)}, y=${position.y.toFixed(2)}, z=${position.z.toFixed(2)}`
      );
    }
  }

  return Promise.resolve();
};

