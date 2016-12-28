import * as React from 'react'
import { Component } from 'react';
import { render }	from 'react-dom';

function noop() { }

declare const window: any;
declare const monaco: any;
//  File copied from react-monaco-editor /src/index.js

export class MonacoEditor extends Component {

	private __current_value: any;
	private __prevent_trigger_change_event: boolean;
	private editor: any;
	private refs: any;

	/*public propTypes = {
		width: PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number,
		]),
		height: PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number,
		]),
		value: PropTypes.string,
		defaultValue: PropTypes.string,
		language: PropTypes.string,
		theme: PropTypes.string,
		options: PropTypes.object,
		editorDidMount: PropTypes.func,
		editorWillMount: PropTypes.func,
		onChange: PropTypes.func,
		requireConfig: PropTypes.object,
	};*/

	public defaultProps = {
		width: '100%',
		height: '100%',
		value: null,
		defaultValue: '',
		language: 'javascript',
		theme: 'vs',
		options: {},
		editorDidMount: noop,
		editorWillMount: noop,
		onChange: noop,
		requireConfig: {},
	};

	public props: any;

	constructor(props) {
		super(props);
		this.__current_value = props.value;
	}
	componentDidMount() {
		this.afterViewInit();
	}
	componentWillUnmount() {
		this.destroyMonaco();
	}
	componentWillUpdate(nextProps) {
		if (nextProps.value !== this.__current_value) {
			this.__prevent_trigger_change_event = true;
			this.editor.setValue(nextProps.value);
			this.__prevent_trigger_change_event = false;
		}
	}
	editorWillMount(monaco) {
		const editorWillMount = this.props.editorWillMount;
		(editorWillMount && editorWillMount(monaco));
	}
	editorDidMount(editor, monaco) {
		const editorDidMount = this.props.editorDidMount;
		const onChange = this.props.onChange;
		editorDidMount(editor, monaco);
		editor.onDidChangeModelContent(event => {
			const value = editor.getValue();
			// Only invoking when user input changed
			if (!this.__prevent_trigger_change_event) {
				onChange(value, event);
			}
			// Always refer to the latest value
			this.__current_value = value;
		});
	}
	afterViewInit() {
		console.log(this.props);
		const requireConfig = this.props.requireConfig || {};
		const loaderUrl = requireConfig.url || 'vs/loader.js';
		const onGotAmdLoader = () => {
					console.log("yo got AMDLoader");

			if (window.__REACT_MONACO_EDITOR_LOADER_ISPENDING__) {
				// Do not use webpack
				if (requireConfig.paths && requireConfig.paths.vs) {
					window.require.config(requireConfig);
				}
			}

			// Load monaco
			window.require(['vs/editor/editor.main'], () => {
				this.initMonaco();
			});

			// Call the delayed callbacks when AMD loader has been loaded
			if (window.__REACT_MONACO_EDITOR_LOADER_ISPENDING__) {
				window.__REACT_MONACO_EDITOR_LOADER_ISPENDING__ = false;
				let loaderCallbacks = window.__REACT_MONACO_EDITOR_LOADER_CALLBACKS__;
				if (loaderCallbacks && loaderCallbacks.length) {
					let currentCallback = loaderCallbacks.shift();
					while (currentCallback) {
						currentCallback.fn.call(currentCallback.context);
						currentCallback = loaderCallbacks.shift();
					}
				}
			}
		};

		// Load AMD loader if necessary
		if (window.__REACT_MONACO_EDITOR_LOADER_ISPENDING__) {
			// We need to avoid loading multiple loader.js when there are multiple editors loading concurrently
			//  delay to call callbacks except the first one
			window.__REACT_MONACO_EDITOR_LOADER_CALLBACKS__ = window.__REACT_MONACO_EDITOR_LOADER_CALLBACKS__ || [];
			window.__REACT_MONACO_EDITOR_LOADER_CALLBACKS__.push({
				context: this,
				fn: onGotAmdLoader
			});
		} else {
			if (typeof window.require === 'undefined') {
				var loaderScript = document.createElement('script');
				loaderScript.type = 'text/javascript';
				loaderScript.src = loaderUrl;
				loaderScript.addEventListener('load', onGotAmdLoader);
				document.body.appendChild(loaderScript);
				window.__REACT_MONACO_EDITOR_LOADER_ISPENDING__ = true;
			} else {
				onGotAmdLoader();
			}
		}
	}

	initMonaco() {
				console.log("yo init Monaco");

		const value = this.props.value !== null ? this.props.value : this.props.defaultValue;
		const { language, theme, options } = this.props;
		const containerElement = this.refs.container;
		if (typeof monaco !== 'undefined') {
			// Before initializing monaco editor
			this.editorWillMount(monaco);
			this.editor = monaco.editor.create(containerElement, {
				value,
				language,
				theme,
				...options,
			});
			// After initializing monaco editor
			this.editorDidMount(this.editor, monaco);
		}
	}
	destroyMonaco() {
		if (typeof this.editor !== 'undefined') {
			this.editor.dispose();
		}
	}
	render() {
		const { width, height } = this.props;
		const fixedWidth = width.toString().indexOf('%') !== -1 ? width : `${width}px`;
		const fixedHeight = height.toString().indexOf('%') !== -1 ? height : `${height}px`;
		const style = {
			width: fixedWidth,
			height: fixedHeight,
		};
		return (
			<div ref="container" style={style} className="react-monaco-editor-container"></div>
		)
	}
}

