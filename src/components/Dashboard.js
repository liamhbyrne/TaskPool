import React, { useState } from "react"
import { Card } from "react-bootstrap"
import { useAuth } from "../contexts/AuthContext"
import { useHistory } from "react-router-dom"
import "../css/Dashboard.css"
import ReactDOM from 'react-dom'
import { auth, db}  from '../firebase'

// Display Functions
function resetContent() {
  var mainContent = document.getElementById("mainContent");
  while (mainContent.lastElementChild) {
    mainContent.removeChild(mainContent.lastElementChild);
  }
}

// Display all the users Active Tasks
async function openActiveTasks() {
  resetContent();
  const taskRef = db.collection("task");
  const myTasks = await taskRef.where("created_by", "==", auth.currentUser.email).get();
  myTasks.forEach(doc => {
    createActiveTask(doc.get("created_by"), doc.get("name"), doc.get("desc"));
  })
}

// Display the current Task Pool
async function openTaskPool() {
  resetContent();
  const taskRef = db.collection("task");
  const myTasks = await taskRef.where("created_by", "!=", auth.currentUser.email).get();
  myTasks.forEach(doc => {
    createPoolTask(doc.get("created_by"), doc.get("name"), doc.get("desc"), doc.get("skills"));
  });
}

// Creates each individual Active Task 
var activeTaskCount = 0;
function createActiveTask (email, name, desc) {
  var elements = <div class="activeTask">
    <h2>{name}</h2>
    <h4>Owner: {email}</h4>
    <p>{desc}</p>
  </div>;
  var mainDiv = document.getElementById("mainContent");
  var tempDiv = document.createElement("div");
  tempDiv.id = activeTaskCount;
  mainDiv.appendChild(tempDiv);
  mainDiv.appendChild(document.createElement("p"));
  ReactDOM.render(elements, document.getElementById(activeTaskCount));
  activeTaskCount++;
}

// Creates each individual Pool Task
var colorMap = {"Firebase":"#ff0460", "Node.js":"#cbdc56", "React":"#64a3ea"};
function createPoolTask(email, name, desc, skills) {
  console.log(typeof skills, skills);
  var elements = <div class="task-container">
    <div class="task-name">{name}</div>
    <div class="task-body">
      <div class="task-desc">{desc}</div>
      <div class="task-skills">
        {skills.map(skill => (
          <div class="task-skill" style={{backgroundColor: colorMap[skill]}}>{skill}</div>
        ))}
      </div>
      <div class="task-owner">{email}</div>
    </div>
  </div>;
  var mainDiv = document.getElementById("mainContent");
  var tempDiv = document.createElement("div");
  tempDiv.id = activeTaskCount;
  mainDiv.appendChild(tempDiv);
  mainDiv.appendChild(document.createElement("p"));
  ReactDOM.render(elements, document.getElementById(activeTaskCount));
}

// Calculates a percentage for how relavent the task is for the currentUser
function calculateRelevancy (userSkills, requiredSkils) {
  var total = requiredSkils.length;
  var same = 0;
  requiredSkils.forEach(skill => {
    userSkills.forEach(userSkill => {
      if (skill.valueOf() === userSkill.valueOf()) {
        same++;
      }
    })
  });
  return (Math.round((same / total) * 100) / 100) * 100
}

// Main Code
export default function Dashboard() {
  const [setError] = useState("")
  const { logout } = useAuth()
  const history = useHistory()

  async function handleLogout() {
    setError("")

    try {
      await logout()
      history.push("/login")
    } catch {
      setError("Failed to log out")
    }
  }

  return (
    <>
      <Card>
        <Card.Body>
          <div class="tabBar">
            <div id="tab" onClick={openActiveTasks}>
              <h1>Active Tasks</h1>
            </div>
            <div id="tab" onClick={openTaskPool}>
              <h1>Task Pool</h1>
            </div>
          </div>

          <div id="mainContent" onLoad={openActiveTasks}></div>
        </Card.Body>
      </Card>
    </>
  )
}