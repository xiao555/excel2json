import React, { Component } from 'react';
import xlsx from 'xlsx';
import stringifyObject from 'stringify-object';
import Clipboard from 'clipboard';
import './App.css';

const defaultFunction = `(data) => { // data是excel文件读取后的JSON数据
  /* processing logic */ 
  return data
}`

class App extends Component {

  constructor (props) {
    super(props)
    // 初始化剪贴板
    this.clipboard = new Clipboard('.copyBtn')
    this.clipboard.on('success', e => {
      e.clearSelection()
      alert('复制成功！')
    })
    this.state = {
      file: null, // 上传的文件
      sheet: 0, // sheet序号
      function: defaultFunction, // 自定义处理函数
      json: '', // 处理结果
      line: 0, // 有效行数
    }
  }

  componentWillUnmount() {
    this.clipboard.destroy()
  }

  changeState = (e, key) => {
    e.preventDefault()
    this.setState({
      [key]: key === 'file' ? e.target.files[0] : e.target.value
    })
  }

  transfer = () => {
    if (!this.state.file) return alert('请选择文件！')
    let reader = new FileReader()
    reader.onload = () => {
      let workbook = xlsx.read(reader.result, { type: 'binary' })
      let data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[this.state.sheet]])
      let fn = eval(this.state.function)
      let result = fn(data)
      this.setState({
        line: result.length,
        json: stringifyObject(result, {
          indent: '  ',
          singleQuotes: false,
        }),
      })
    }
    reader.readAsBinaryString(this.state.file)
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Excel2JSON</h1>
        </header>
        <main>
          <div className='container'>
            <div className='Input'>
              <div className='item'>
                <label className='uploadfile mr-2'>
                  <span>{this.state.file ? this.state.file.name : '请选择文件'}</span>
                  <input type='file' 
                    accept='.xls, .xlsx' 
                    onChange={e => this.changeState(e, 'file')}/>
                </label>
                <label>
                  Sheet序号：
                  <input className='sheet' 
                    type='number' 
                    min='0' 
                    value={this.state.sheet} 
                    onChange={e => this.changeState(e, 'sheet')}/>
                </label>
              </div>
              <div className='item'>
                <textarea className='function-textarea' 
                  rows='10' 
                  cols='84' 
                  placeholder='自定义处理（JS）' 
                  value={this.state.function} 
                  onChange={e => this.changeState(e, 'function')}/>
              </div>
              <div className='item'>
                <button className='btn mr-2' 
                  type='button' 
                  onClick={this.transfer}>
                  转换
                </button>
                <button className='btn copyBtn' 
                  type='button' 
                  data-clipboard-target="#result">
                  复制结果
                </button>
              </div>
              <span>有效行数：{ this.state.line }</span>
            </div>
            <div className='Result'>
              <textarea id='result' value={this.state.json}/>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
