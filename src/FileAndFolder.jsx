import {
  MdExpandLess,
  MdExpandMore,
  MdDeleteOutline,
} from "react-icons/md";
import { FiFolderPlus } from "react-icons/fi";
import { AiOutlineFileAdd } from "react-icons/ai";
import { useState } from "react";

const FileAndFolder = ({ data, setData, idCounter, setIdCounter }) => {
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState({
    open: false,
    type: "",
    parentId: null,
  });
  const [input, setInput] = useState("");

  // toggle folder open/close
  const toggleFolder = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // recursive add node
  const addNode = (tree, parentId, newNode) => {
    return tree.map((node) => {
      if (node.id === parentId && node.isFolder) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: addNode(node.children, parentId, newNode),
        };
      }
      return node;
    });
  };

  // recursive delete node
  const deleteNode = (tree, id) => {
    return tree
      .filter((node) => node.id !== id)
      .map((node) => ({
        ...node,
        children: node.children
          ? deleteNode(node.children, id)
          : node.children,
      }));
  };

  // open modal
  const openModal = (type, parentId) => {
    setModal({ open: true, type, parentId });
    setInput("");
  };

  // handle add
  const handleAdd = () => {
    if (!input.trim()) return;

    const newNode = {
      id: idCounter,
      name: input,
      isFolder: modal.type === "folder",
      children: modal.type === "folder" ? [] : undefined,
    };

    setData((prev) => addNode(prev, modal.parentId, newNode));
    setIdCounter((prev) => prev + 1);
    setModal({ open: false, type: "", parentId: null });
    setInput("");
  };

  // render tree
  const renderTree = (nodes, level = 0) => {
    return nodes.map((node) => (
      <div
        key={node.id}
        className="tree-node"
        style={{ marginLeft: level === 0 ? 0 : 20 }}
      >
        <div className="tree-row">

          {node.isFolder && (
            <span
              className="icon-btn"
              onClick={() => toggleFolder(node.id)}
              role="button"
              tabIndex={0}
            >
              {expanded[node.id] ? <MdExpandLess /> : <MdExpandMore />}
            </span>
          )}

          <span className={`node-name ${node.isFolder ? "folder" : "file"}`}>
            {node.name}
          </span>

          {node.isFolder && (
            <>
              <FiFolderPlus
                className="icon-btn action-icon"
                data-testid={`add-folder-${node.id}`}
                onClick={() => openModal("folder", node.id)}
              />
              <AiOutlineFileAdd
                className="icon-btn action-icon"
                data-testid={`add-file-${node.id}`}
                onClick={() => openModal("file", node.id)}
              />
            </>
          )}

          <MdDeleteOutline
            className="icon-btn delete-icon"
            data-testid="delete"
            onClick={() => setData((prev) => deleteNode(prev, node.id))}
          />
        </div>

        {node.isFolder && expanded[node.id] && node.children && (
          <div>{renderTree(node.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="explorer-panel">
      {renderTree(data)}

      {/* MODAL */}
      {modal.open && (
        <div className="modal-overlay">
          <div className="modal-box">
            <input
              className="modal-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter name"
            />

            <button className="btn btn-primary" data-testid="add" onClick={handleAdd}>
              Add
            </button>

            <button
              className="btn btn-secondary"
              data-testid="cancel"
              onClick={() =>
                setModal({ open: false, type: "", parentId: null })
              }
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileAndFolder;