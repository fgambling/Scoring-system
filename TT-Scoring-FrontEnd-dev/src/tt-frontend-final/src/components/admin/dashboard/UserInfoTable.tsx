import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';
import { useModal } from '@/context/ModalContext';
import AddUser from '@/components/admin/popups/AddUser';
import { UserData } from '@/interface/user-interface';

function createData(
  _id: number,
  username: string,
  email: string,
  roles: string[],
  status: string
): UserData {
  return {
    _id,
    username,
    email,
    roles,
    status
  };
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof UserData>(
  order: Order,
  orderBy: Key,
): (
  a: UserData,
  b: UserData,
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof UserData;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'username',
    numeric: false,
    disablePadding: false,
    label: 'NAME',
  },
  {
    id: 'email',
    numeric: false,
    disablePadding: false,
    label: 'EMAIL',
  },
  {
    id: 'roles',
    numeric: false,
    disablePadding: false,
    label: 'ROLE',
  },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: 'STATUS',
  }
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof UserData) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof UserData) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead sx={{ border: '1px solid black' }}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ border: '1px solid black', textAlign: 'center' }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const EnhancedTableToolbar: React.FC = () => {
  const { toggle } = useModal();

  return (
    <span
      className="uppercase underline underline-offset-2 mb-4 inline-block cursor-pointer"
      onClick={() => toggle(<AddUser />, () => location.reload())}
    >
      Create User
    </span>
  );
};

interface UserInfoTableProps {
  rows: UserData[];
  setUser: (value: UserData) => void;
}

const EnhancedTable: React.FC<UserInfoTableProps> = ({ setUser, rows }) => {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof UserData>('username');
  const [selected, setSelected] = React.useState<UserData>(rows[0]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(6);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof UserData,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, user: UserData) => {
    setUser(user);
    setSelected(user);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: number) => selected._id === id;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      stableSort(
        rows.map((row) => createData(row._id, row.username, row.email, row.roles, row.status)),
        getComparator(order, orderBy),
      ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, rows],
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, backgroundColor: '#f9f4fa', boxShadow: 'initial' }}>
        <EnhancedTableToolbar />
        <TableContainer>
          <Table
            sx={{ minWidth: 750, border: '1px solid black' }}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {visibleRows.map((row) => {
                const isItemSelected = isSelected(row._id);
                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row)}
                    tabIndex={-1}
                    key={row._id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell align="left" sx={{ border: '1px solid black' }}>{row.username}</TableCell>
                    <TableCell align="left" sx={{ border: '1px solid black' }}>{row.email}</TableCell>
                    <TableCell align="left" sx={{ border: '1px solid black', textAlign: 'center' }}>
                      {(row.roles as string[]).map((role, index) => (
                        <span key={index}>{role.toUpperCase()}{index !== row.roles.length - 1 && ' / '}</span>
                      ))}
                    </TableCell>
                    <TableCell align="left" sx={{ border: '1px solid black', textAlign: 'center', color: row.status === 'Active' ? '#58ae55' : '#de334a' }}>
                      {row.status.toUpperCase()}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow style={{ height: 53 * emptyRows }}></TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[6, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ border: '1px solid black', marginTop: '-1px' }}
        />
      </Paper>
    </Box>
  );
};

export default EnhancedTable;
