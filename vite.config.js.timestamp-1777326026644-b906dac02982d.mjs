// vite.config.js
import { defineConfig } from "file:///sessions/quirky-trusting-bohr/mnt/ironLog_v1/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/quirky-trusting-bohr/mnt/ironLog_v1/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///sessions/quirky-trusting-bohr/mnt/ironLog_v1/node_modules/vite-plugin-pwa/dist/index.js";
var ICON_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='120' fill='%237C6EFA'/%3E%3Ctext x='256' y='340' text-anchor='middle' font-size='280'%3E%F0%9F%8F%8B%EF%B8%8F%3C/text%3E%3C/svg%3E";
var vite_config_default = defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify((/* @__PURE__ */ new Date()).toISOString())
  },
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      registerType: "prompt",
      srcDir: "src",
      filename: "sw.js",
      manifest: {
        name: "IronLog",
        short_name: "IronLog",
        description: "Track. Lift. Grow.",
        start_url: "/",
        display: "standalone",
        background_color: "#0c0c12",
        theme_color: "#0c0c12",
        orientation: "portrait",
        icons: [
          {
            src: ICON_SVG,
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html}"]
      },
      devOptions: {
        enabled: false
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvcXVpcmt5LXRydXN0aW5nLWJvaHIvbW50L2lyb25Mb2dfdjFcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9zZXNzaW9ucy9xdWlya3ktdHJ1c3RpbmctYm9oci9tbnQvaXJvbkxvZ192MS92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vc2Vzc2lvbnMvcXVpcmt5LXRydXN0aW5nLWJvaHIvbW50L2lyb25Mb2dfdjEvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcblxuY29uc3QgSUNPTl9TVkcgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbCwlM0NzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB2aWV3Qm94PScwIDAgNTEyIDUxMiclM0UlM0NyZWN0IHdpZHRoPSc1MTInIGhlaWdodD0nNTEyJyByeD0nMTIwJyBmaWxsPSclMjM3QzZFRkEnLyUzRSUzQ3RleHQgeD0nMjU2JyB5PSczNDAnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZvbnQtc2l6ZT0nMjgwJyUzRSVGMCU5RiU4RiU4QiVFRiVCOCU4RiUzQy90ZXh0JTNFJTNDL3N2ZyUzRVwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBkZWZpbmU6IHtcbiAgICBfX0JVSUxEX1RJTUVfXzogSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKS50b0lTT1N0cmluZygpKSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgVml0ZVBXQSh7XG4gICAgICBzdHJhdGVnaWVzOiAnaW5qZWN0TWFuaWZlc3QnLFxuICAgICAgcmVnaXN0ZXJUeXBlOiAncHJvbXB0JyxcbiAgICAgIHNyY0RpcjogJ3NyYycsXG4gICAgICBmaWxlbmFtZTogJ3N3LmpzJyxcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6ICdJcm9uTG9nJyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ0lyb25Mb2cnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RyYWNrLiBMaWZ0LiBHcm93LicsXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjMGMwYzEyJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMGMwYzEyJyxcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCcsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBJQ09OX1NWRyxcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2Uvc3ZnK3htbCcsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIGluamVjdE1hbmlmZXN0OiB7XG4gICAgICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbH0nXSxcbiAgICAgIH0sXG4gICAgICBkZXZPcHRpb25zOiB7XG4gICAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5VCxTQUFTLG9CQUFvQjtBQUN0VixPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBRXhCLElBQU0sV0FBVztBQUVqQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUEsSUFDTixnQkFBZ0IsS0FBSyxXQUFVLG9CQUFJLEtBQUssR0FBRSxZQUFZLENBQUM7QUFBQSxFQUN6RDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLE1BQ04sWUFBWTtBQUFBLE1BQ1osY0FBYztBQUFBLE1BQ2QsUUFBUTtBQUFBLE1BQ1IsVUFBVTtBQUFBLE1BQ1YsVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1Qsa0JBQWtCO0FBQUEsUUFDbEIsYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2IsT0FBTztBQUFBLFVBQ0w7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLGdCQUFnQjtBQUFBLFFBQ2QsY0FBYyxDQUFDLG9CQUFvQjtBQUFBLE1BQ3JDO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVixTQUFTO0FBQUEsTUFDWDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
