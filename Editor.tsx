import * as React from 'react';
import { Component } from 'react';
import { render } from 'react-dom';
import { MonacoEditor } from './Monaco';

export class Editor extends Component {
	private state: any;
	private editor: any;
	private props: any;
	private editorMarginPadding: number = 20;
	private setState: Function;

	private options = {
			automaticLayout: false,
			cursorBlinking: 'phase',
			cursorStyle: 'line',
			parameterHints: true,
			readOnly: false,
			roundedSelection: true,
			scrollBeyondLastLine: false,
			scrollbar: {
				vertical: 'visible',
			},
			selectOnLineNumbers: true,
			theme: 'vs-dark',
			wrappingColumn: 0,
		};

	constructor(props: any) {
		super(props);
		this.state = {
			code: `// type your code... \n
				// test 2 fds  df sdf s df sd f sd fs df s df s df s df sd fs d fs df sd f sd fs df sd f sd\n
				// test 2\n
				// test 2\n
				// test 2\n
				// test 2\n
				// last line is 45`,
			};
		window.addEventListener('resize', this.resize.bind(this));
	}

	public resize() {
		if (this.editor && this.editor.layout) {
			this.editor.layout({height: this.props.height - this.editorMarginPadding,
							width: this.props.width - this.editorMarginPadding});
		}
	}

	public editorDidMount = (editor: any) => {
		this.editor = editor;
	}

	public onChange = (newValue: any, e: any) => {
		// this.setState({code: newValue});
	}

	public componentDidUpdate() {
		this.editor.layout({height: this.props.height - this.editorMarginPadding,
							width: this.props.width - this.editorMarginPadding});
	}

	public render() {
		return (
			<MonacoEditor
				width={this.props.width - this.editorMarginPadding}
				height={this.props.height - this.editorMarginPadding}
				language="javascript"
				value={this.state.code}
				options={this.options}
				onChange={this.onChange}
				editorDidMount={this.editorDidMount}
			/>
		);
	}
}
