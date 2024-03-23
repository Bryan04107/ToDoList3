import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import "./Todo.css";
import { auth, db, addTask, deleteTask, editTask } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate, Link } from "react-router-dom";
import { query, collection, getDocs, where } from "firebase/firestore";

function ToDo() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [currentTaskTitle, setCurrentTaskTitle] = useState("");
  const [currentTaskDescription, setCurrentTaskDescription] = useState("");
  const [user, loading] = useAuthState(auth);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return navigate("/");
    fetchUserName();
    fetchUserTasks();
  }, [user, loading]);

  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      setName(data.name);
    } catch (err) {
      console.error(err);
      alert("An error occurred while fetching user data");
    }
  };

  const fetchUserTasks = async () => {
    try {
      const q = query(collection(db, "tasks"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setList(tasks);
    } catch (err) {
      console.error(err);
      alert("An error occurred while fetching tasks");
    }
  };

  const updateTaskList = (taskList) => {
    const totalTasks = taskList.length;
    const totalFinishedTasks = taskList.filter((task) => task.finished).length;
    const totalUnfinishedTasks = totalTasks - totalFinishedTasks;

    setList(taskList);
    // setTotalTasks(totalTasks);
    // setTotalFinishedTasks(totalFinishedTasks);
    // setTotalUnfinishedTasks(totalUnfinishedTasks);
  };

  const addItem = () => {
    if (newTaskTitle !== "") {
      const newTask = {
        title: newTaskTitle,
        description: newTaskDescription,
        finished: false,
      };
      addTask(newTaskTitle, newTaskDescription, false, user.uid);
      const updatedList = [...list, newTask];
      updateTaskList(updatedList);
      setShowAddModal(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
    }
  };

  const deleteItem = (taskId) => {
    const updatedList = list.filter((task) => task.id !== taskId);
    deleteTask(taskId);
    updateTaskList(updatedList);
  };

  const saveEditedTask = () => {
    const updatedList = list.map((task) => {
      if (task.id === currentTaskId) {
        return {
          ...task,
          title: currentTaskTitle,
          description: currentTaskDescription,
        };
      }
      return task;
    });
    editTask(
      currentTaskId,
      currentTaskTitle,
      currentTaskDescription,
      undefined
    );
    updateTaskList(updatedList);
    hideEditModal();
  };

  const toggleState = (taskId) => {
    const updatedTodos = list.map((task) => {
      if (task.id === taskId) {
        const newFinishedState = !task.finished;
        editTask(taskId, undefined, undefined, newFinishedState);

        return { ...task, finished: newFinishedState };
      }
      return task;
    });
    setList(updatedTodos);
  };

  const displayEditModal = (taskId, title, description) => {
    setShowEditModal(true);
    setCurrentTaskId(taskId);
    setCurrentTaskTitle(title);
    setCurrentTaskDescription(description);
  };

  const hideEditModal = () => {
    setShowEditModal(false);
    setCurrentTaskId(null);
    setCurrentTaskTitle("");
    setCurrentTaskDescription("");
  };

  return (
    <Container style={{ margin: 0, padding: 0 }}>
      <div className="todo-header">
        <Row>
          <Col
            className="text-start"
            style={{ fontSize: "48px", marginBottom: 10, paddingLeft: 25 }}
          >
            ToDoList
          </Col>
          <Col
            className="text-end"
            style={{ fontSize: "24px", marginBottom: 10, paddingRight: 25 }}
          >
            <Link to="/profile" className="login-detail-box">
              <div>{user.displayName}</div>
            </Link>
          </Col>
        </Row>
      </div>

      <Row className="inputs">
        <Col>
          <Button
            variant="dark"
            onClick={() => setShowAddModal(true)}
            className="w-100"
          >
            Add+
          </Button>
        </Col>
        <Col>
          <Dropdown>
            <Dropdown.Toggle
              variant="dark"
              id="dropdown-basic"
              className="w-100"
            >
              Filter: {filter}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilter("All")}>
                All
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setFilter("Finished")}>
                Finished
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setFilter("Unfinished")}>
                Unfinished
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      <Row className="lists">
        <ListGroup style={{ padding: 0 }}>
          {list.map((task) => {
            if (
              (filter === "Finished" && !task.finished) ||
              (filter === "Unfinished" && task.finished)
            ) {
              return null;
            }
            return (
              <div key={task.id}>
                <ListGroup.Item
                  variant={task.finished ? "success" : "dark"}
                  action
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "95%",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.finished}
                      onChange={() => toggleState(task.id)}
                      style={{ marginRight: "10px" }}
                    />
                    <div style={{ width: "100%", overflowWrap: "break-word" }}>
                      <p
                        style={{
                          marginBottom: 0,
                          fontSize: "20px",
                          fontWeight: "bold",
                        }}
                      >
                        {task.title}
                      </p>
                      <p style={{ fontSize: "12px", color: "#6c757d" }}>
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <div style={{ width: "100%", textAlign: "right" }}>
                    <Button
                      style={{ marginBottom: "10px" }}
                      variant="light"
                      onClick={() => deleteItem(task.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      style={{ marginBottom: "10px", marginLeft: "10px" }}
                      variant="light"
                      onClick={() =>
                        displayEditModal(task.id, task.title, task.description)
                      }
                    >
                      Edit
                    </Button>
                  </div>
                </ListGroup.Item>
              </div>
            );
          })}
        </ListGroup>
      </Row>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="taskTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="taskDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={addItem}>
            Add Task
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={hideEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editTaskTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={currentTaskTitle}
                onChange={(e) => setCurrentTaskTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="editTaskDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={currentTaskDescription}
                onChange={(e) => setCurrentTaskDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideEditModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveEditedTask}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ToDo;
