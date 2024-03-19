import axios from 'axios';

export default (router, { services, getSchema, env }) => {
	const { ItemsService } = services;
  
	router.post('/uploadurl', async (req, res) => {
	  try {
		const response = await axios.post(
		  'https://api.mux.com/video/v1/uploads',
		  { "new_asset_settings": { "playback_policy": ["public"] } },
		  { auth: { username: env.MUX_ACCESS_TOKEN, password: env.MUX_SECRET } }
		);
		// Include both the URL and ID in the response
		res.json({ 
		  uploadUrl: response.data.data.url,
		  id: response.data.data.id
		});
	  } catch (error) {
		console.error(error); // Logging the error
		res.status(500).send('Failed to get upload URL from Mux.');
	  }
	});
  
	router.post('/webhook', async (req, res) => {
	  // Ensure that the request body exists
	  if (!req.body) {
		return res.status(400).send('Request body is required');
	  }
  
	  const { type, data } = req.body;
  
	  if (!type || !data) {
		return res.status(400).send('Missing required fields in the webhook payload');
	  }
  
	  try {
		// Log the type of event for debugging
		console.log(`Received Mux event: ${type}`);
  
		// Handle the asset_created event
		if (type === 'video.upload.asset_created') {
			const uploadId = data.id; // Adjust based on actual payload structure
			const assetId = data.asset_id; // Adjust based on actual payload structure
			console.log(JSON.stringify(req.body, null, 2));

		  console.log(`Asset created for upload ID: ${uploadId} with asset ID: ${assetId}`);
  
		  const schema = await getSchema();
		  const itemsService = new ItemsService('videos', {
			schema,
			// accountability: req.accountability,
		  });
  
		  // Search for the item with the matching uploadId
		  const searchResult = await itemsService.readByQuery({
			filter: { uploadId },
			limit: 1,
		  });
  
		  if (searchResult && searchResult.length > 0) {
			const itemId = searchResult[0].id;
			// Update the item with the assetId
			await itemsService.updateOne(itemId, { assetId });
			console.log(`Updated item ${itemId} with asset ID: ${assetId}`);
			res.status(200).send('Asset created event processed successfully.');
		  } else {
			console.log('No matching item found for the provided uploadId.');
			res.status(404).send('No matching item found.');
		  }
		} else if (type === 'video.asset.ready') { 
			console.log(JSON.stringify(req.body, null, 2));
			const uploadId = data.upload_id;  // Adjust based on actual payload structure
			const playbackId = data.playback_ids[0].id; // Adjust based on actual payload structure

		  console.log(`Playback ID created for upload ID: ${uploadId} with Playback ID: ${playbackId}`);
  
		  const schema = await getSchema();
		  const itemsService = new ItemsService('videos', {
			schema,
			// accountability: req.accountability,
		  });
  
		  // Search for the item with the matching uploadId
		  const searchResult = await itemsService.readByQuery({
			filter: { uploadId },
			limit: 1,
		  });
  
		  if (searchResult && searchResult.length > 0) {
			const itemId = searchResult[0].id;
			// Update the item with the assetId
			await itemsService.updateOne(itemId, { playback_id: playbackId});
			console.log(`Updated item ${itemId} with playback ID: ${playbackId}`);
			res.status(200).send('Asset created event processed successfully.');
		  } else {
			console.log('No matching item found for the provided uploadId.');
			res.status(404).send('No matching item found.');
		  }
		} else {
		  console.log(`Unhandled event type: ${type}`);
		  res.status(200).send('Event received but not handled.');
		}
	  } catch (error) {
		console.error('Failed to process webhook event:', error);
		res.status(500).send('Error processing webhook event.');
	  }
	});
  };
  
