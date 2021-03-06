import React, { useEffect, useRef, useState } from 'react';
import { Button, ButtonGroup, Dropdown, Nav, Navbar, NavLink, OverlayTrigger, Tooltip } from 'react-bootstrap';

import './playground.css';
import { examples } from './examples';
import { JsonEditor } from './jsonEditor';
import { BicepEditor } from './bicepEditor';
import { copyShareLinkToClipboard, handleShareLink } from './utils';
import { decompile } from './lspInterop';

let initialFile = examples['101/1vm-2nics-2subnets-1vnet'];
handleShareLink(content => initialFile = content ?? initialFile);

export const Playground : React.FC = () => {
  const [jsonContent, setJsonContent] = useState('');
  const [bicepContent, setBicepContent] = useState('');
  const [initialContent, setInitialContent] = useState(initialFile);
  const [copied, setCopied] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    window.addEventListener('hashchange', () => handleShareLink(content => {
        if (content != null) {
          setInitialContent(content);
        }
      }));
  }, []);

  const handlCopyClick = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    copyShareLinkToClipboard(bicepContent);
  }

  const handleDecompileClick = (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const jsonContents = e.target.result.toString();
        const bicepContents = decompile(jsonContents);
        setInitialContent(bicepContents);
      } catch (err) {
        alert(err);
      }
    };

    reader.readAsText(file);
  }

  const dropdownItems = Object.keys(examples).map(example => (
    <Dropdown.Item key={example} eventKey={example} active={false}>{example}</Dropdown.Item>
  ));

  const createTooltip = (text: string) => (
    <Tooltip id="button-tooltip">
      {text}
    </Tooltip>
  );

  return <>
    <input type="file" ref={uploadInputRef} style={{ display: 'none' }} onChange={e => handleDecompileClick(e.currentTarget.files[0])} accept="application/json" multiple={false} />
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand>Bicep Playground</Navbar.Brand>
      <Nav className="ml-auto">
        <OverlayTrigger placement="bottom" overlay={createTooltip('Copy a shareable link to clipboard')}>
          <Button size="sm" variant="primary" className="mx-1" onClick={handlCopyClick}>{copied ? 'Copied' : 'Copy Link'}</Button>
        </OverlayTrigger>
        <OverlayTrigger placement="bottom" overlay={createTooltip('Upload an ARM template JSON file to decompile to Bicep')}>
          <Button size="sm" variant="primary" className="mx-1" onClick={() => uploadInputRef.current.click()}>Decompile</Button>
        </OverlayTrigger>
        <Dropdown as={ButtonGroup} onSelect={key => setInitialContent(examples[key])}>
          <OverlayTrigger placement="bottom" overlay={createTooltip('Select a sample Bicep file to start')}>
            <Dropdown.Toggle as={Button} size="sm" variant="primary" className="mx-1">Sample Template</Dropdown.Toggle>
          </OverlayTrigger>
          <Dropdown.Menu align="right">
            {dropdownItems}
          </Dropdown.Menu>
        </Dropdown>
      </Nav>
    </Navbar>
    <div className="playground-container">
      <div className="playground-editorpane">
        <BicepEditor onBicepChange={setBicepContent} onJsonChange={setJsonContent} initialCode={initialContent} />
      </div>
      <div className="playground-editorpane">
        <JsonEditor content={jsonContent} />
      </div>
    </div>
  </>
};