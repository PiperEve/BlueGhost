// metro.config.js
module.exports = {
	resolver: {
		assetExts: ['mp3', 'wav', 'ogg', 'm4a']
	},
	transformer: {
		getTransformOptions: async () => ({
			transform: {
				experimentalImportSupport: false,
				inlineRequires: true,
			},
		}),
	},
};