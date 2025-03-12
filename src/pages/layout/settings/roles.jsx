import { useEffect, useState, useRef } from "react";
import Layout from "../../../components/layout/layout";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Toast } from "primereact/toast";
import {
  getAllRoles,
  deleteRole,
  createRole,
  getRoleById,
  updateRole,
} from "../../../services/settings/roles";
import { useAuth } from "../../../states/use-auth";
import "../../styles/settings/roles.css";

const Roles = () => {
  const toast = useRef(null);
  const [rolesData, setRolesData] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [visible, setVisible] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialRoleData, setInitialRoleData] = useState(null);
  const [errors, setErrors] = useState({ name: "", description: "" });

  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const fetchedRoles = await getAllRoles();
        setRolesData(fetchedRoles);
        setFilteredRoles(fetchedRoles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const filteredData = rolesData.filter(
      (role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filteredData);
  }, [searchTerm, rolesData]);

  const validateInputs = (role) => {
    const newErrors = {
      name: !role.name.trim() ? "Role name is required" : "",
      description: !role.description.trim() ? "Description is required" : "",
    };
    setErrors(newErrors);
    return !newErrors.name && !newErrors.description;
  };

  const confirmDelete = (event, id) => {
    event.stopPropagation();
    confirmPopup({
      target: event.currentTarget,
      message: "Are you sure you want to delete this role?",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDeleteRole(id),
      reject: () => {
        toast.current.show({
          severity: "info",
          summary: "Cancelled",
          detail: "Delete action cancelled",
          life: 3000,
        });
      },
    });
  };

  const handleDeleteRole = async (id) => {
    try {
      await deleteRole(id);
      setRolesData((prevRoles) => prevRoles.filter((role) => role.id !== id));
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Role deleted successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete role",
        life: 3000,
      });
    }
  };

  const handleCreateRole = async () => {
    if (!validateInputs(newRole)) {
      return;
    }

    try {
      const createdRole = await createRole(newRole);
      setRolesData((prevRoles) => [...prevRoles, createdRole]);
      setVisible(false);
      setNewRole({ name: "", description: "" });
      setErrors({ name: "", description: "" });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Role created successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error creating role:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create role",
        life: 3000,
      });
    }
  };

  const handleRowClick = async (rowData) => {
    try {
      const role = await getRoleById(rowData.id);
      setSelectedRole(role);
      setInitialRoleData(role);
      setVisible(true);
      setIsEditMode(false);
      setErrors({ name: "", description: "" });
    } catch (error) {
      console.error("Error fetching role by ID:", error);
    }
  };

  const handleEditRole = async () => {
    if (!validateInputs(selectedRole)) {
      return;
    }

    try {
      await updateRole(selectedRole.id, selectedRole);
      setRolesData((prevRoles) =>
        prevRoles.map((role) =>
          role.id === selectedRole.id ? selectedRole : role
        )
      );
      setIsEditMode(false);
      setErrors({ name: "", description: "" });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Role updated successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update role",
        life: 3000,
      });
    }
  };

  const handleCancelEdit = () => {
    setSelectedRole(initialRoleData);
    setIsEditMode(false);
    setErrors({ name: "", description: "" });
  };

  const actionBodyTemplate = (rowData) => {
    if (currentUser?.role_id !== 1) {
      return null;
    }

    return (
      <Button
        icon="pi pi-trash"
        rounded
        outlined
        severity="danger"
        aria-label="Delete"
        onClick={(e) => confirmDelete(e, rowData.id)}
      />
    );
  };

  return (
    <Layout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <Card className="roles-container">
        <h2 className="roles-title">Role</h2>
        <div className="roles-card">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Role Name or Description..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {(currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
              <button
                className="create-button"
                onClick={() => {
                  setVisible(true);
                  setErrors({ name: "", description: "" });
                }}
              >
                Create
              </button>
            )}
          </div>
        </div>

        <DataTable
          value={filteredRoles}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 30]}
          tableStyle={{ width: "100%" }}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          onRowClick={(e) => handleRowClick(e.data)}
        >
          <Column field="id" header="ID" style={{ width: "15%" }} sortable />
          <Column
            field="name"
            header="Role Name"
            style={{ width: "25%" }}
            sortable
          />
          <Column
            field="description"
            header="Description"
            style={{ width: "50%" }}
            sortable
          />

          {currentUser?.role_id === 1 && (
            <Column
              body={actionBodyTemplate}
              header="Actions"
              style={{ width: "10%" }}
            />
          )}
        </DataTable>
      </Card>

      <Dialog
        header={selectedRole ? "Role Details" : "Create New Role"}
        visible={visible}
        onHide={() => {
          setVisible(false);
          setSelectedRole(null);
          setIsEditMode(false);
          setErrors({ name: "", description: "" });
        }}
        className="custom-dialog"
      >
        <div className="p-fluid">
          <div className="p-field custom-field">
            <label htmlFor="name">Role Name</label>
            <InputText
              id="name"
              value={selectedRole ? selectedRole.name : newRole.name}
              onChange={(e) =>
                selectedRole
                  ? setSelectedRole({ ...selectedRole, name: e.target.value })
                  : setNewRole({ ...newRole, name: e.target.value })
              }
              className={`custom-input ${errors.name ? "p-invalid" : ""}`}
              readOnly={selectedRole && !isEditMode}
            />
            {errors.name && <small className="p-error">{errors.name}</small>}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="description">Description</label>
            <InputText
              id="description"
              value={
                selectedRole ? selectedRole.description : newRole.description
              }
              onChange={(e) =>
                selectedRole
                  ? setSelectedRole({
                      ...selectedRole,
                      description: e.target.value,
                    })
                  : setNewRole({ ...newRole, description: e.target.value })
              }
              className={`custom-input ${
                errors.description ? "p-invalid" : ""
              }`}
              readOnly={selectedRole && !isEditMode}
            />
            {errors.description && (
              <small className="p-error">{errors.description}</small>
            )}
          </div>
        </div>
        <div className="custom-button">
          {selectedRole ? (
            <>
              {isEditMode ? (
                <>
                  <Button
                    label="Cancel"
                    icon="pi pi-times"
                    onClick={handleCancelEdit}
                    className="p-button custom-cancel-button"
                  />

                  {(currentUser?.role_id === 1 ||
                    currentUser?.role_id === 2) && (
                    <Button
                      label="Save"
                      icon="pi pi-check"
                      onClick={handleEditRole}
                      className="p-button custom-save-button"
                    />
                  )}
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
                onClick={handleCreateRole}
                className="p-button custom-save-button"
              />
            )
          )}
        </div>
      </Dialog>
    </Layout>
  );
};

export default Roles;
