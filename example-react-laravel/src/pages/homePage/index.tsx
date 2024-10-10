import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  TableHead,
  TextField,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import axiosInstance from "../../utils/axiosInstance";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const useStyles = makeStyles({
  title: {
    textAlign: "center",
  },
});

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number
  ) => void;
}

interface ITask {
  id: string;
  task_name: string;
  status: number;
  create_by: number;
  create_at: Date;
}

enum EStatus {
  NEW = 0,
  DOING = 1,
  DONE = 2,
}

interface IFormValue {
  taskName: string;
  status: EStatus;
  create_by?: number;
  create_at?: Date;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

const HomePage = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const classes = useStyles();
  const [tasksData, setTasksData] = useState<ITask[]>([]);
  const [isOpenFormDialog, setIsOpenFormDialog] = useState(false);
  const editModeRef = useRef<{ isEditMode: boolean; taskId: string }>({
    isEditMode: false,
    taskId: "",
  });
  const {
    control,
    reset,
    formState: { errors: formErrors },
    handleSubmit,
  } = useForm<IFormValue>({
    defaultValues: {
      taskName: "",
      status: EStatus.NEW,
    },
    resolver: zodResolver(
      z.object({
        taskName: z.string().min(1, "Task name is required!"),
        status: z.number(),
      })
    ),
  });

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tasksData.length) : 0;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchAllTask = async () => {
    try {
      const response = await axiosInstance.get("/tasks");
      if (response.status === 200) {
        setTasksData(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      await fetchAllTask();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseDialog = () => {
    setIsOpenFormDialog(false);
  };

  const handleOpenFormDialog = () => {
    setIsOpenFormDialog(true);
  };

  const handleOpenFormEditDialog = (rowData: ITask) => {
    setIsOpenFormDialog(true);
    reset({
      taskName: rowData.task_name,
      status: rowData.status,
    });
    editModeRef.current = {
      isEditMode: true,
      taskId: rowData.id,
    };
  };

  const onValid = async (values: IFormValue) => {
    const payload: any = {
      task_name: values.taskName,
      status: values.status,
      create_by: 0,
    };
    let statusCode: null | number = null;

    if (editModeRef.current.isEditMode) {
      const response = await axiosInstance.patch(
        `/tasks/${editModeRef.current.taskId}`,
        payload
      );
      statusCode = response.status;
    } else {
      const response = await axiosInstance.post("/tasks", payload);
      statusCode = response.status;
    }

    if (statusCode === 201 || statusCode === 200) {
      reset({
        taskName: "",
        status: EStatus.NEW,
      });
      await fetchAllTask();
      handleCloseDialog();
      editModeRef.current = {
        isEditMode: false,
        taskId: "",
      };
    }
  };

  useEffect(() => {
    fetchAllTask();
  }, []);

  return (
    <>
      <Box>
        <h1 className={classes.title}>Tasks Management</h1>
        <Box>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleOpenFormDialog()}
          >
            Add
          </Button>
          <TableContainer component={Paper} sx={{ marginTop: 1 }}>
            <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
              <TableHead>
                <TableRow>
                  <TableCell>Task name</TableCell>
                  <TableCell align="right">Create at</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? tasksData.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : tasksData
                ).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      {row.task_name}
                    </TableCell>
                    <TableCell style={{ width: 160 }} align="right">
                      {/* {row.create_at} */}
                    </TableCell>
                    <TableCell style={{ width: 160 }} align="right">
                      {row.status}
                    </TableCell>
                    <TableCell style={{ width: 160 }} align="right">
                      <Box
                        sx={{
                          display: "flex",
                          columnGap: "10px",
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            handleDeleteTask(row.id);
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => handleOpenFormEditDialog(row)}
                        >
                          Edit
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[
                      5,
                      10,
                      25,
                      { label: "All", value: -1 },
                    ]}
                    colSpan={3}
                    count={tasksData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    slotProps={{
                      select: {
                        inputProps: {
                          "aria-label": "rows per page",
                        },
                        native: true,
                      },
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      <Dialog
        open={isOpenFormDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          component: "form",
          onSubmit: handleSubmit(onValid),
        }}
      >
        <DialogTitle>Add task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here.
            We will send updates occasionally.
          </DialogContentText>

          <Controller
            control={control}
            name="taskName"
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                margin="dense"
                label="Task name"
                type="text"
                fullWidth
                variant="standard"
                error={!!formErrors.taskName}
                helperText={formErrors.taskName?.message || ""}
              />
            )}
          />
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <RadioGroup
                {...field}
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                }}
              >
                <FormControlLabel
                  value={EStatus.NEW}
                  control={<Radio />}
                  label="New"
                />
                <FormControlLabel
                  value={EStatus.DOING}
                  control={<Radio />}
                  label="Doing"
                />
                <FormControlLabel
                  value={EStatus.DONE}
                  control={<Radio />}
                  label="Done"
                />
              </RadioGroup>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HomePage;
