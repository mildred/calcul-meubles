<script>
  import { onMount } from 'svelte'
  let containerElement

/*
  // Credits: https://github.com/peter-hartmann/jscad-render-ts/blob/master/src/index.ts
  import makeViewer from '@jscad/csg-viewer'
  import scadApi from '@jscad/scad-api'

  export let item

  let containerElement

  const viewerOptions = {
    background: [0.211, 0.2, 0.207, 1], // [1, 1, 1, 1],//54, 51, 53
    meshColor: [0.4, 0.6, 0.5, 1],
    grid: {
      display: true,
      color: [0, 1, 1, 0.1]
    },
    camera: {
      position: [45, 55, 70]
    },
    controls: {
      limits: {
        maxDistance: 1600,
        minDistance: 0.01
      },
      autoRotate: {
        enabled: true,
      }
    }
  }

  onMount(() => {
    const scenes = [];
    const gggg = {
      scenes,
      csgViewer: null,
    };

    scenes[0] = () => {
      var scene = function () {
        const { cube, sphere, torus } = scadApi.primitives3d
        const { difference, union } = scadApi.booleanOps
        const solid1 = cube({ size: 15, center: true })
        const solid2 = sphere({ r: 10, fn: 100, type: 'geodesic' })
        const result = difference(solid1, solid2)
        return union(result, torus({ ri: 3, ro: 10 }))
      }();
      scenes[0] = () => scene;
      return scene;
    }

    function rnd(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    scenes[1] = function () {
      const { cube, sphere, torus } = scadApi.primitives3d
      const { difference, union, intersection } = scadApi.booleanOps
      const { translate } = scadApi.transformations
      const ops = [
        difference,
        union,
        intersection,
      ]
      const obs = [
        () => cube({ size: 15, center: true }),
        () => sphere({ r: 10, fn: 50, type: 'geodesic' }),
        () => torus({ ri: 3, ro: 10 }),
      ];
      let result = cube({ size: 15, center: true })
      const n = 10
      for (let i = 0; i < n; i++) {
        const ob = obs[i % obs.length]()
        const op = ops[i % ops.length]
        result = op(result, translate([rnd(-10, 10) + n, rnd(-10, 10) + n, rnd(-10, 10) + n], ob))
      }
      return result
    }

    const { csgViewer, viewerDefaults, viewerState$ } = makeViewer(containerElement, viewerOptions)
    csgViewer(viewerOptions, { solids: scenes[1]() })
    gggg.csgViewer = csgViewer;

    function viewSceneN(i){
      gggg.csgViewer({}, { solids: gggg.scenes[i]() })
    }
  })
*/
</script>

<canvas
  bind:this={containerElement}></canvas>
