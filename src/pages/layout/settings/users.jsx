import { useEffect, useState, useRef } from "react";
import Layout from "../../../components/layout/layout";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Toast } from "primereact/toast";
import {
  getAllUsers,
  deleteUsers,
  createUsers,
  getUsersById,
  updateUsers,
} from "../../../services/settings/users";
import { getAllRoles } from "../../../services/settings/roles";
import { getAllJobPositions } from "../../../services/settings/job-positions";
import { useAuth } from "../../../states/use-auth";
import "../../styles/settings/users.css";

const Users = () => {
  const toast = useRef(null);
  const [usersData, setUsersData] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
    role_id: null,
    jobPosition_id: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialUserData, setInitialUserData] = useState(null);
  const [errors, setErrors] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
    role_id: "",
    jobPosition_id: "",
  });
  const [roles, setRoles] = useState([]);
  const [jobPositions, setJobPositions] = useState([]);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        const fetchedRoles = await getAllRoles();
        const fetchedJobPositions = await getAllJobPositions();

        setUsersData(fetchedUsers);
        setFilteredUsers(fetchedUsers);
        setRoles(fetchedRoles);
        setJobPositions(fetchedJobPositions);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = usersData.filter(
      (user) =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filteredData);
  }, [searchTerm, usersData]);

  const validateInputs = (user) => {
    const newErrors = {
      username: !user.username.trim() ? "Username is required" : "",
      full_name: !user.full_name.trim() ? "Full name is required" : "",
      email: !user.email.trim() ? "Email is required" : "",
      password:
        !user.password.trim() && !isEditMode ? "Password is required" : "",
      role_id: !user.role_id ? "Role is required" : "",
      jobPosition_id: !user.jobPosition_id ? "Job Position is required" : "",
    };
    setErrors(newErrors);
    return (
      !newErrors.username &&
      !newErrors.full_name &&
      !newErrors.email &&
      !newErrors.password &&
      !newErrors.role_id &&
      !newErrors.jobPosition_id
    );
  };

  const handlecreateUsers = async () => {
    if (!validateInputs(newUser)) {
      return;
    }

    try {
      const createdUser = await createUsers(newUser);
      setUsersData((prevUsers) => [...prevUsers, createdUser]);
      setVisible(false);
      setNewUser({
        username: "",
        full_name: "",
        email: "",
        password: "",
        role_id: null,
        jobPosition_id: null,
      });
      setErrors({
        username: "",
        full_name: "",
        email: "",
        password: "",
        role_id: "",
        jobPosition_id: "",
      });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "User created successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create user",
        life: 3000,
      });
    }
  };

  const handleEditUser = async () => {
    if (!validateInputs(selectedUser)) {
      return;
    }

    try {
      const userDataToUpdate = { ...selectedUser };
      if (!userDataToUpdate.password) {
        delete userDataToUpdate.password;
      }

      await updateUsers(selectedUser.id, userDataToUpdate);
      setUsersData((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? selectedUser : user
        )
      );
      setIsEditMode(false);
      setErrors({
        username: "",
        full_name: "",
        email: "",
        password: "",
        role_id: "",
        jobPosition_id: "",
      });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "User updated successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update user",
        life: 3000,
      });
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUsers(id);
      setUsersData((prevUsers) => prevUsers.filter((user) => user.id !== id));
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "User deleted successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete user",
        life: 3000,
      });
    }
  };

  const handleRowClick = async (rowData) => {
    try {
      const user = await getUsersById(rowData.id);
      setSelectedUser({ ...user, password: "" });
      setInitialUserData(user);
      setVisible(true);
      setIsEditMode(false);
      setErrors({
        username: "",
        full_name: "",
        email: "",
        password: "",
        role_id: "",
        jobPosition_id: "",
      });
    } catch (error) {
      console.error("Error fetching user by ID:", error);
    }
  };

  const handleCancelEdit = () => {
    setSelectedUser(initialUserData);
    setIsEditMode(false);
    setErrors({
      username: "",
      full_name: "",
      email: "",
      password: "",
      role_id: "",
      jobPosition_id: "",
    });
  };

  const actionBodyTemplate = (rowData) => {
    if (currentUser?.role_id !== 1 && currentUser?.role_id !== 2) {
      return null;
    }

    return (
      <button
        className="action-button"
        onClick={(e) => {
          e.stopPropagation();
          confirmPopup({
            target: e.currentTarget,
            message: "Are you sure you want to delete this user?",
            icon: "pi pi-exclamation-triangle",
            acceptClassName: "p-button-danger",
            accept: () => handleDeleteUser(rowData.id),
            reject: () => {
              toast.current.show({
                severity: "info",
                summary: "Cancelled",
                detail: "Delete action cancelled",
                life: 3000,
              });
            },
          });
        }}
      >
        <i className="pi pi-trash action-icon"></i>
      </button>
    );
  };

  return (
    <Layout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <Card className="roles-container">
        <h2 className="roles-title">Users</h2>
        <div className="roles-card">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Full Name or Email..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {(currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
              <button
                className="create-button"
                onClick={() => {
                  setVisible(true);
                  setSelectedUser(null);
                  setIsEditMode(false);
                  setErrors({
                    username: "",
                    full_name: "",
                    email: "",
                    password: "",
                    role_id: "",
                    jobPosition_id: "",
                  });
                }}
              >
                Create
              </button>
            )}
          </div>
        </div>

        <DataTable
          value={filteredUsers}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 30]}
          tableStyle={{ width: "100%" }}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          onRowClick={(e) => handleRowClick(e.data)}
        >
          <Column field="id" header="ID" style={{ width: "10%" }} sortable />
          <Column
            field="full_name"
            header="Full Name"
            style={{ width: "25%" }}
            sortable
          />
          <Column
            field="email"
            header="Email"
            style={{ width: "25%" }}
            sortable
          />
          <Column
            field="job_position_title"
            header="Job Position"
            style={{ width: "30%" }}
            sortable
          />

          {(currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
            <Column
              body={actionBodyTemplate}
              header="Actions"
              style={{ width: "10%" }}
            />
          )}
        </DataTable>
      </Card>

      <Dialog
        header={selectedUser ? "User Details" : "Create New User"}
        visible={visible}
        onHide={() => {
          setVisible(false);
          setSelectedUser(null);
          setIsEditMode(false);
          setErrors({
            username: "",
            full_name: "",
            email: "",
            password: "",
            role_id: "",
            jobPosition_id: "",
          });
        }}
        className="custom-dialog"
      >
        <div className="p-fluid">
          <div className="p-field custom-field">
            <label htmlFor="username">Username</label>
            <InputText
              id="username"
              value={selectedUser ? selectedUser.username : newUser.username}
              onChange={(e) =>
                selectedUser
                  ? setSelectedUser({
                      ...selectedUser,
                      username: e.target.value,
                    })
                  : setNewUser({ ...newUser, username: e.target.value })
              }
              className={`custom-input ${errors.username ? "p-invalid" : ""}`}
              readOnly={selectedUser && !isEditMode}
            />
            {errors.username && (
              <small className="p-error">{errors.username}</small>
            )}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="full_name">Full Name</label>
            <InputText
              id="full_name"
              value={selectedUser ? selectedUser.full_name : newUser.full_name}
              onChange={(e) =>
                selectedUser
                  ? setSelectedUser({
                      ...selectedUser,
                      full_name: e.target.value,
                    })
                  : setNewUser({ ...newUser, full_name: e.target.value })
              }
              className={`custom-input ${errors.full_name ? "p-invalid" : ""}`}
              readOnly={selectedUser && !isEditMode}
            />
            {errors.full_name && (
              <small className="p-error">{errors.full_name}</small>
            )}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              value={selectedUser ? selectedUser.email : newUser.email}
              onChange={(e) =>
                selectedUser
                  ? setSelectedUser({ ...selectedUser, email: e.target.value })
                  : setNewUser({ ...newUser, email: e.target.value })
              }
              className={`custom-input ${errors.email ? "p-invalid" : ""}`}
              readOnly={selectedUser && !isEditMode}
            />
            {errors.email && <small className="p-error">{errors.email}</small>}
          </div>
          {(!selectedUser || isEditMode) && (
            <div className="p-field custom-field">
              <label htmlFor="password">Password</label>
              <InputText
                id="password"
                type="password"
                value={selectedUser ? selectedUser.password : newUser.password}
                onChange={(e) =>
                  selectedUser
                    ? setSelectedUser({
                        ...selectedUser,
                        password: e.target.value,
                      })
                    : setNewUser({ ...newUser, password: e.target.value })
                }
                className={`custom-input ${errors.password ? "p-invalid" : ""}`}
                placeholder={
                  isEditMode ? "Leave blank to keep current password" : ""
                }
              />
              {errors.password && (
                <small className="p-error">{errors.password}</small>
              )}
            </div>
          )}
          <div className="p-field custom-field">
            <label htmlFor="role_id">Role</label>
            <Dropdown
              id="role_id"
              value={selectedUser ? selectedUser.role_id : newUser.role_id}
              options={roles.map((role) => ({
                label: role.name,
                value: role.id,
              }))}
              onChange={(e) =>
                selectedUser
                  ? setSelectedUser({ ...selectedUser, role_id: e.value })
                  : setNewUser({ ...newUser, role_id: e.value })
              }
              placeholder="Select a Role"
              className={`custom-input ${errors.role_id ? "p-invalid" : ""}`}
              disabled={selectedUser && !isEditMode}
            />
            {errors.role_id && (
              <small className="p-error">{errors.role_id}</small>
            )}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="jobPosition_id">Job Position</label>
            <Dropdown
              id="jobPosition_id"
              value={
                selectedUser
                  ? selectedUser.jobPosition_id
                  : newUser.jobPosition_id
              }
              options={jobPositions.map((jobPosition) => ({
                label: jobPosition.title,
                value: jobPosition.id,
              }))}
              onChange={(e) =>
                selectedUser
                  ? setSelectedUser({
                      ...selectedUser,
                      jobPosition_id: e.value,
                    })
                  : setNewUser({ ...newUser, jobPosition_id: e.value })
              }
              placeholder="Select a Job Position"
              className={`custom-input ${
                errors.jobPosition_id ? "p-invalid" : ""
              }`}
              disabled={selectedUser && !isEditMode}
            />
            {errors.jobPosition_id && (
              <small className="p-error">{errors.jobPosition_id}</small>
            )}
          </div>
        </div>
        <div className="custom-button">
          {selectedUser ? (
            <>
              {isEditMode ? (
                <>
                  <Button
                    label="Cancel"
                    icon="pi pi-times"
                    onClick={handleCancelEdit}
                    className="p-button custom-cancel-button"
                  />
                  <Button
                    label="Save"
                    icon="pi pi-check"
                    onClick={handleEditUser}
                    className="p-button custom-save-button"
                  />
                </>
              ) : (
                (currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
                  <Button
                    label="Edit"
                    icon="pi pi-pencil"
                    onClick={() => setIsEditMode(true)}
                    className="p-button custom-edit-button"
                  />
                )
              )}
            </>
          ) : (
            (currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
              <Button
                label="Save"
                icon="pi pi-check"
                onClick={handlecreateUsers}
                className="p-button custom-save-button"
              />
            )
          )}
        </div>
      </Dialog>
    </Layout>
  );
};

export default Users;
