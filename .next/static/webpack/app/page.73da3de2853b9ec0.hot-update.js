"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/page",{

/***/ "(app-pages-browser)/./src/components/ErrorBoundary.tsx":
/*!******************************************!*\
  !*** ./src/components/ErrorBoundary.tsx ***!
  \******************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @chakra-ui/react */ \"(app-pages-browser)/./node_modules/@chakra-ui/react/dist/esm/box/box.mjs\");\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @chakra-ui/react */ \"(app-pages-browser)/./node_modules/@chakra-ui/react/dist/esm/typography/heading.mjs\");\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @chakra-ui/react */ \"(app-pages-browser)/./node_modules/@chakra-ui/react/dist/esm/typography/text.mjs\");\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @chakra-ui/react */ \"(app-pages-browser)/./node_modules/@chakra-ui/react/dist/esm/button/button.mjs\");\n/* harmony import */ var _lib_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/logger */ \"(app-pages-browser)/./src/lib/logger.ts\");\n\n\n\n\nclass ErrorBoundary extends (react__WEBPACK_IMPORTED_MODULE_1___default().Component) {\n    static getDerivedStateFromError(error) {\n        return {\n            hasError: true,\n            error\n        };\n    }\n    componentDidCatch(error, errorInfo) {\n        // Log the error with more details\n        _lib_logger__WEBPACK_IMPORTED_MODULE_2__[\"default\"].error(\"ErrorBoundary caught an error:\", {\n            error: error.toString(),\n            componentStack: errorInfo.componentStack,\n            stack: error.stack\n        });\n    }\n    render() {\n        if (this.state.hasError) {\n            var _this_state_error;\n            return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__.Box, {\n                textAlign: \"center\",\n                py: 10,\n                px: 6,\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Heading, {\n                        as: \"h2\",\n                        size: \"xl\",\n                        mb: 2,\n                        children: \"Oops! Something went wrong.\"\n                    }, void 0, false, {\n                        fileName: \"/Users/oleksiydzhos/Documents/personal/test-helper/src/components/ErrorBoundary.tsx\",\n                        lineNumber: 41,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.Text, {\n                        color: \"gray.500\",\n                        mb: 6,\n                        children: ((_this_state_error = this.state.error) === null || _this_state_error === void 0 ? void 0 : _this_state_error.message) || \"An unexpected error occurred.\"\n                    }, void 0, false, {\n                        fileName: \"/Users/oleksiydzhos/Documents/personal/test-helper/src/components/ErrorBoundary.tsx\",\n                        lineNumber: 44,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_6__.Button, {\n                        colorScheme: \"blue\",\n                        onClick: this.resetErrorBoundary,\n                        children: \"Try again\"\n                    }, void 0, false, {\n                        fileName: \"/Users/oleksiydzhos/Documents/personal/test-helper/src/components/ErrorBoundary.tsx\",\n                        lineNumber: 47,\n                        columnNumber: 11\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/oleksiydzhos/Documents/personal/test-helper/src/components/ErrorBoundary.tsx\",\n                lineNumber: 40,\n                columnNumber: 9\n            }, this);\n        }\n        return this.props.children;\n    }\n    constructor(props){\n        super(props);\n        this.resetErrorBoundary = ()=>{\n            this.setState({\n                hasError: false,\n                error: null\n            });\n        };\n        this.state = {\n            hasError: false,\n            error: null\n        };\n    }\n}\n/* harmony default export */ __webpack_exports__[\"default\"] = (ErrorBoundary);\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9jb21wb25lbnRzL0Vycm9yQm91bmRhcnkudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBb0Q7QUFDVTtBQUM1QjtBQVdsQyxNQUFNTSxzQkFBc0JOLHdEQUFlO0lBTXpDLE9BQU9RLHlCQUF5QkMsS0FBWSxFQUFzQjtRQUNoRSxPQUFPO1lBQUVDLFVBQVU7WUFBTUQ7UUFBTTtJQUNqQztJQUVBRSxrQkFBa0JGLEtBQVksRUFBRUcsU0FBb0IsRUFBRTtRQUNwRCxrQ0FBa0M7UUFDbENQLG1EQUFNQSxDQUFDSSxLQUFLLENBQUMsa0NBQWtDO1lBQzdDQSxPQUFPQSxNQUFNSSxRQUFRO1lBQ3JCQyxnQkFBZ0JGLFVBQVVFLGNBQWM7WUFDeENDLE9BQU9OLE1BQU1NLEtBQUs7UUFDcEI7SUFDRjtJQU1BQyxTQUFTO1FBQ1AsSUFBSSxJQUFJLENBQUNDLEtBQUssQ0FBQ1AsUUFBUSxFQUFFO2dCQU9oQjtZQU5QLHFCQUNFLDhEQUFDVCxpREFBR0E7Z0JBQUNpQixXQUFVO2dCQUFTQyxJQUFJO2dCQUFJQyxJQUFJOztrQ0FDbEMsOERBQUNsQixxREFBT0E7d0JBQUNtQixJQUFHO3dCQUFLQyxNQUFLO3dCQUFLQyxJQUFJO2tDQUFHOzs7Ozs7a0NBR2xDLDhEQUFDcEIsa0RBQUlBO3dCQUFDcUIsT0FBTzt3QkFBWUQsSUFBSTtrQ0FDMUIsMEJBQUksQ0FBQ04sS0FBSyxDQUFDUixLQUFLLGNBQWhCLDBEQUFrQmdCLE9BQU8sS0FBSTs7Ozs7O2tDQUVoQyw4REFBQ3JCLG9EQUFNQTt3QkFDTHNCLGFBQVk7d0JBQ1pDLFNBQVMsSUFBSSxDQUFDQyxrQkFBa0I7a0NBQ2pDOzs7Ozs7Ozs7Ozs7UUFLUDtRQUVBLE9BQU8sSUFBSSxDQUFDQyxLQUFLLENBQUNDLFFBQVE7SUFDNUI7SUEzQ0FDLFlBQVlGLEtBQXlCLENBQUU7UUFDckMsS0FBSyxDQUFDQTthQWlCUkQscUJBQXFCO1lBQ25CLElBQUksQ0FBQ0ksUUFBUSxDQUFDO2dCQUFFdEIsVUFBVTtnQkFBT0QsT0FBTztZQUFLO1FBQy9DO1FBbEJFLElBQUksQ0FBQ1EsS0FBSyxHQUFHO1lBQUVQLFVBQVU7WUFBT0QsT0FBTztRQUFLO0lBQzlDO0FBeUNGO0FBRUEsK0RBQWVILGFBQWFBLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL2NvbXBvbmVudHMvRXJyb3JCb3VuZGFyeS50c3g/ZjYwYSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgRXJyb3JJbmZvLCBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCb3gsIEhlYWRpbmcsIFRleHQsIEJ1dHRvbiB9IGZyb20gJ0BjaGFrcmEtdWkvcmVhY3QnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICdAL2xpYi9sb2dnZXInO1xuXG5pbnRlcmZhY2UgRXJyb3JCb3VuZGFyeVByb3BzIHtcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbn1cblxuaW50ZXJmYWNlIEVycm9yQm91bmRhcnlTdGF0ZSB7XG4gIGhhc0Vycm9yOiBib29sZWFuO1xuICBlcnJvcjogRXJyb3IgfCBudWxsO1xufVxuXG5jbGFzcyBFcnJvckJvdW5kYXJ5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PEVycm9yQm91bmRhcnlQcm9wcywgRXJyb3JCb3VuZGFyeVN0YXRlPiB7XG4gIGNvbnN0cnVjdG9yKHByb3BzOiBFcnJvckJvdW5kYXJ5UHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHsgaGFzRXJyb3I6IGZhbHNlLCBlcnJvcjogbnVsbCB9O1xuICB9XG5cbiAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21FcnJvcihlcnJvcjogRXJyb3IpOiBFcnJvckJvdW5kYXJ5U3RhdGUge1xuICAgIHJldHVybiB7IGhhc0Vycm9yOiB0cnVlLCBlcnJvciB9O1xuICB9XG5cbiAgY29tcG9uZW50RGlkQ2F0Y2goZXJyb3I6IEVycm9yLCBlcnJvckluZm86IEVycm9ySW5mbykge1xuICAgIC8vIExvZyB0aGUgZXJyb3Igd2l0aCBtb3JlIGRldGFpbHNcbiAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yQm91bmRhcnkgY2F1Z2h0IGFuIGVycm9yOicsIHtcbiAgICAgIGVycm9yOiBlcnJvci50b1N0cmluZygpLFxuICAgICAgY29tcG9uZW50U3RhY2s6IGVycm9ySW5mby5jb21wb25lbnRTdGFjayxcbiAgICAgIHN0YWNrOiBlcnJvci5zdGFja1xuICAgIH0pO1xuICB9XG5cbiAgcmVzZXRFcnJvckJvdW5kYXJ5ID0gKCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoeyBoYXNFcnJvcjogZmFsc2UsIGVycm9yOiBudWxsIH0pO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmhhc0Vycm9yKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8Qm94IHRleHRBbGlnbj1cImNlbnRlclwiIHB5PXsxMH0gcHg9ezZ9PlxuICAgICAgICAgIDxIZWFkaW5nIGFzPVwiaDJcIiBzaXplPVwieGxcIiBtYj17Mn0+XG4gICAgICAgICAgICBPb3BzISBTb21ldGhpbmcgd2VudCB3cm9uZy5cbiAgICAgICAgICA8L0hlYWRpbmc+XG4gICAgICAgICAgPFRleHQgY29sb3I9eydncmF5LjUwMCd9IG1iPXs2fT5cbiAgICAgICAgICAgIHt0aGlzLnN0YXRlLmVycm9yPy5tZXNzYWdlIHx8ICdBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkLid9XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGNvbG9yU2NoZW1lPVwiYmx1ZVwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnJlc2V0RXJyb3JCb3VuZGFyeX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBUcnkgYWdhaW5cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEVycm9yQm91bmRhcnk7XG4iXSwibmFtZXMiOlsiUmVhY3QiLCJCb3giLCJIZWFkaW5nIiwiVGV4dCIsIkJ1dHRvbiIsImxvZ2dlciIsIkVycm9yQm91bmRhcnkiLCJDb21wb25lbnQiLCJnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IiLCJlcnJvciIsImhhc0Vycm9yIiwiY29tcG9uZW50RGlkQ2F0Y2giLCJlcnJvckluZm8iLCJ0b1N0cmluZyIsImNvbXBvbmVudFN0YWNrIiwic3RhY2siLCJyZW5kZXIiLCJzdGF0ZSIsInRleHRBbGlnbiIsInB5IiwicHgiLCJhcyIsInNpemUiLCJtYiIsImNvbG9yIiwibWVzc2FnZSIsImNvbG9yU2NoZW1lIiwib25DbGljayIsInJlc2V0RXJyb3JCb3VuZGFyeSIsInByb3BzIiwiY2hpbGRyZW4iLCJjb25zdHJ1Y3RvciIsInNldFN0YXRlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/components/ErrorBoundary.tsx\n"));

/***/ })

});