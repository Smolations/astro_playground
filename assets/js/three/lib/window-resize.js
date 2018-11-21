import * as THREE from 'three';
// This THREEx helper makes it easy to handle window resize.
// It will update renderer and camera when window is resized.
//
// # Usage
//
// **Step 1**: Start updating renderer and camera
//
// ```const windowResize = windowResize(aRenderer, aCamera)```
//
// **Step 2**: Start updating renderer and camera
//
// ```windowResize.stop()```
// # Code


/**
 * Update renderer and camera when the window is resized
 *
 * @param {Object} renderer the renderer to update
 * @param {Object} Camera the camera to update
*/
export default function WindowResize(renderer, camera) {
  const callback  = () => {
    // notify the renderer of the size change
    renderer.setSize( window.innerWidth, window.innerHeight );
    // update the camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  // bind the resize event
  window.addEventListener('resize', callback, false);
  // return .stop() the function to stop watching window resize
  return {
    /**
     * Stop watching window resize
    */
    stop  : function(){
      window.removeEventListener('resize', callback);
    }
  };
};
