<template>
	<private-view title="Mux Uploader">
	  <div v-if="uploadUrl">
		<mux-uploader :endpoint="uploadUrl" ref="muxUploader"></mux-uploader>
	  </div>
	  <div v-else>
		Loading upload URL...
	  </div>
	</private-view>
  </template>
  
  <script>
  import '@mux/mux-uploader';
  import { useApi } from '@directus/extensions-sdk';
  import { onMounted, ref } from 'vue';
  
  export default {
	props: {
	  value: {
		type: String,
		default: null,
	  },
	},
	setup() {
	  const uploadUrl = ref(null);
	  const uploadId = ref(null);
	  const api = useApi();
  
	  onMounted(async () => {
		try {
		  const response = await fetch('/muxgenerator/uploadurl', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			},
		  });
		  if (!response.ok) {
			throw new Error('Failed to generate upload URL');
		  }
		  const data = await response.json();
		  uploadUrl.value = data.uploadUrl;
		  uploadId.value = data.id;
  
		  // Use api.post to save the uploadId to Directus immediately after obtaining it
		  try {
			const payload = {
			  uploadId: uploadId.value,
			  // Include any other fields your collection requires
			};
			await api.post(`items/videos`, payload);
			console.log('Upload ID saved to Directus');
		  } catch (error) {
			console.error('Error saving upload ID to Directus:', error);
		  }
		} catch (error) {
		  console.error('Error fetching upload URL:', error);
		}
	  });
  
	  return {
		uploadUrl,
		uploadId,
	  };
	},
  };
  </script>
  