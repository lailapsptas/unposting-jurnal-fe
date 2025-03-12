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
  getAllJobPositions,
  deleteJobPosition,
  createJobPosition,
  getJobPositionById,
  updateJobPosition,
} from "../../../services/settings/job-positions";
import { useAuth } from "../../../states/use-auth";
import "../../styles/settings/job-positions.css";

const JobPositions = () => {
  const toast = useRef(null);
  const [jobPositionsData, setJobPositionsData] = useState([]);
  const [filteredJobPositions, setFilteredJobPositions] = useState([]);
  const [visible, setVisible] = useState(false);
  const [newJobPosition, setNewJobPosition] = useState({
    title: "",
    purpose: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobPosition, setSelectedJobPosition] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialJobPositionData, setInitialJobPositionData] = useState(null);
  const [errors, setErrors] = useState({ title: "", purpose: "" });

  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchJobPositions = async () => {
      try {
        const fetchedJobPositions = await getAllJobPositions();
        setJobPositionsData(fetchedJobPositions);
        setFilteredJobPositions(fetchedJobPositions);
      } catch (error) {
        console.error("Error fetching job positions:", error);
      }
    };

    fetchJobPositions();
  }, []);

  useEffect(() => {
    const filteredData = jobPositionsData.filter(
      (jobPosition) =>
        jobPosition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jobPosition.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobPositions(filteredData);
  }, [searchTerm, jobPositionsData]);

  const validateInputs = (jobPosition) => {
    const newErrors = {
      title: !jobPosition.title.trim() ? "Job title is required" : "",
      purpose: !jobPosition.purpose.trim() ? "Purpose is required" : "",
    };
    setErrors(newErrors);
    return !newErrors.title && !newErrors.purpose;
  };

  const confirmDelete = (event, id) => {
    event.stopPropagation();
    confirmPopup({
      target: event.currentTarget,
      message: "Are you sure you want to delete this job position?",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDeleteJobPosition(id),
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

  const handleDeleteJobPosition = async (id) => {
    if (currentUser?.role_id !== 1) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "You do not have permission to delete job positions",
        life: 3000,
      });
      return;
    }

    try {
      await deleteJobPosition(id);
      setJobPositionsData((prevJobPositions) =>
        prevJobPositions.filter((jobPosition) => jobPosition.id !== id)
      );
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Job position deleted successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error deleting job position:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete job position",
        life: 3000,
      });
    }
  };

  const handleCreateJobPosition = async () => {
    if (currentUser?.role_id !== 1 && currentUser?.role_id !== 2) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "You do not have permission to create job positions",
        life: 3000,
      });
      return;
    }

    if (!validateInputs(newJobPosition)) {
      return;
    }

    try {
      const createdJobPosition = await createJobPosition(newJobPosition);
      setJobPositionsData((prevJobPositions) => [
        ...prevJobPositions,
        createdJobPosition,
      ]);
      setVisible(false);
      setNewJobPosition({ title: "", purpose: "" });
      setErrors({ title: "", purpose: "" });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Job position created successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error creating job position:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create job position",
        life: 3000,
      });
    }
  };

  const handleRowClick = async (rowData) => {
    try {
      const jobPosition = await getJobPositionById(rowData.id);
      setSelectedJobPosition(jobPosition);
      setInitialJobPositionData(jobPosition);
      setVisible(true);
      setIsEditMode(false);
      setErrors({ title: "", purpose: "" });
    } catch (error) {
      console.error("Error fetching job position by ID:", error);
    }
  };

  const handleEditJobPosition = async () => {
    if (currentUser?.role_id !== 1 && currentUser?.role_id !== 2) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "You do not have permission to edit job positions",
        life: 3000,
      });
      return;
    }

    if (!validateInputs(selectedJobPosition)) {
      return;
    }

    try {
      await updateJobPosition(selectedJobPosition.id, selectedJobPosition);
      setJobPositionsData((prevJobPositions) =>
        prevJobPositions.map((jobPosition) =>
          jobPosition.id === selectedJobPosition.id
            ? selectedJobPosition
            : jobPosition
        )
      );
      setIsEditMode(false);
      setErrors({ title: "", purpose: "" });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Job position updated successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error updating job position:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update job position",
        life: 3000,
      });
    }
  };

  const handleCancelEdit = () => {
    setSelectedJobPosition(initialJobPositionData);
    setIsEditMode(false);
    setErrors({ title: "", purpose: "" });
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
      <Card className="job-container">
        <h2 className="job-title">Job Positions</h2>
        <div className="job-card">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Job Title or Purpose..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {(currentUser?.role_id === 1 || currentUser?.role_id === 2) && (
              <button
                className="create-button"
                onClick={() => {
                  setVisible(true);
                  setErrors({ title: "", purpose: "" });
                }}
              >
                Create
              </button>
            )}
          </div>
        </div>

        <DataTable
          value={filteredJobPositions}
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
            field="title"
            header="Job Title"
            style={{ width: "30%" }}
            sortable
          />
          <Column
            field="purpose"
            header="Purpose"
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
        header={
          selectedJobPosition
            ? "Job Position Details"
            : "Create New Job Position"
        }
        visible={visible}
        onHide={() => {
          setVisible(false);
          setSelectedJobPosition(null);
          setIsEditMode(false);
          setErrors({ title: "", purpose: "" });
        }}
        className="custom-dialog"
      >
        <div className="p-fluid">
          <div className="p-field custom-field">
            <label htmlFor="title">Job Title</label>
            <InputText
              id="title"
              value={
                selectedJobPosition
                  ? selectedJobPosition.title
                  : newJobPosition.title
              }
              onChange={(e) =>
                selectedJobPosition
                  ? setSelectedJobPosition({
                      ...selectedJobPosition,
                      title: e.target.value,
                    })
                  : setNewJobPosition({
                      ...newJobPosition,
                      title: e.target.value,
                    })
              }
              className={`custom-input ${errors.title ? "p-invalid" : ""}`}
              readOnly={selectedJobPosition && !isEditMode}
            />
            {errors.title && <small className="p-error">{errors.title}</small>}
          </div>
          <div className="p-field custom-field">
            <label htmlFor="purpose">Purpose</label>
            <InputText
              id="purpose"
              value={
                selectedJobPosition
                  ? selectedJobPosition.purpose
                  : newJobPosition.purpose
              }
              onChange={(e) =>
                selectedJobPosition
                  ? setSelectedJobPosition({
                      ...selectedJobPosition,
                      purpose: e.target.value,
                    })
                  : setNewJobPosition({
                      ...newJobPosition,
                      purpose: e.target.value,
                    })
              }
              className={`custom-input ${errors.purpose ? "p-invalid" : ""}`}
              readOnly={selectedJobPosition && !isEditMode}
            />
            {errors.purpose && (
              <small className="p-error">{errors.purpose}</small>
            )}
          </div>
        </div>
        <div className="custom-button">
          {selectedJobPosition ? (
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
                      onClick={handleEditJobPosition}
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
                onClick={handleCreateJobPosition}
                className="p-button custom-save-button"
              />
            )
          )}
        </div>
      </Dialog>
    </Layout>
  );
};

export default JobPositions;
