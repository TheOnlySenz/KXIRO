const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Customize the config before returning it.
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
  };

  // Add web-specific optimizations
  if (env.mode === 'production') {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
  }

  // Add custom webpack plugins for better web support
  config.plugins = config.plugins || [];
  
  // Add HTML webpack plugin configuration for meta tags
  const HtmlWebpackPlugin = config.plugins.find(
    plugin => plugin.constructor.name === 'HtmlWebpackPlugin'
  );
  
  if (HtmlWebpackPlugin) {
    HtmlWebpackPlugin.options.meta = {
      ...HtmlWebpackPlugin.options.meta,
      'twitter:card': 'summary_large_image',
      'twitter:site': '@IdeaSpark',
      'twitter:creator': '@IdeaSpark',
      'twitter:title': 'IdeaSpark - Share Your Startup Ideas',
      'twitter:description': 'Connect with brilliant minds and share your viral startup ideas. Find co-founders, investors, and builders.',
      'twitter:image': 'https://ideaspark.com/og-image.png',
      'og:title': 'IdeaSpark - Share Your Startup Ideas',
      'og:description': 'Connect with brilliant minds and share your viral startup ideas. Find co-founders, investors, and builders.',
      'og:image': 'https://ideaspark.com/og-image.png',
      'og:url': 'https://ideaspark.com',
      'og:type': 'website',
      'og:site_name': 'IdeaSpark',
    };
  }

  return config;
};