<template>
	<div v-if="value">
	  <!-- Using v-if to ensure mux-player is only attempted to be rendered when a playbackId is present -->
	  <video>https://stream.mux.com/dr6lNq4kG02kk1XUV01z2jvfDykh7U4EjlNRhzW3oUj01E.m3u8?redundant_streams=true</video>
	  <mux-player
	  			debug  
				:playback-id="value" 
				metadata-video-title="test"
				controls
				@error="handlePlayerError"
            @play="handlePlay">
	  </mux-player>

	  <mux-video
    :playback-id="value"
    metadata-video-title="Big Buck Bunny"
    metadata-viewer-user-id="user-id-1234"
    controls
  ></mux-video>
	</div>
	<div v-else>
	  No Playback ID Found
	  </div>	
  </template>
  
  <script>
  import '@mux/mux-player'; // Ensure correct import based on how web components are registered
  import '@mux/mux-video';

  export default {
	props: {
	  value: {
		type: String,
		default: null,
	  },
	},
	methods: {
  handlePlayerError(event) {
    console.error('Player Error:', event.detail);
  },
  handlePlay() {
    console.log('Playback started');
  },
}

  };
  </script>
  