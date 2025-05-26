import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Box,
  Paper,
  Chip,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
} from "@mui/material";
import { db, collection, getDocs } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import UserNavbar from "./UserNavbar";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";

const BrowseClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    sortClubs(sortBy);
  }, [sortBy]);

  const fetchClubs = async () => {
    const querySnapshot = await getDocs(collection(db, "clubs"));
    const clubsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      contactInfo: doc.data().contactInfo || {},
      updates: doc.data().updates || [],
    }));
    const sorted = sortClubs(sortBy, clubsList);
    setClubs(sorted);
  };

  const sortClubs = (sortType, data = clubs) => {
    const sorted = [...data].sort((a, b) => {
      if (sortType === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    setClubs(sorted);
    return sorted;
  };

  const handleSortChange = (e, newSort) => {
    if (newSort) setSortBy(newSort);
  };

  return (
    <>
      <UserNavbar />

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          Browse Clubs
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Here's a list of all active clubs with their contact details and recent updates.
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="medium">
            Sort by:
          </Typography>
          <ToggleButtonGroup
            value={sortBy}
            exclusive
            onChange={handleSortChange}
            color="primary"
          >
            <ToggleButton value="name">
              <SortByAlphaIcon sx={{ mr: 1 }} /> Name
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Box sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 950 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Club Name</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Description</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Email</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Phone</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Updates</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clubs.map((club) => (
                      <TableRow
                        key={club.id}
                        sx={{
                          "&:hover": {
                            backgroundColor: "#f0f4ff",
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{club.name}</TableCell>
                        <TableCell>{club.description}</TableCell>
                        <TableCell>{club.contactInfo?.email || "N/A"}</TableCell>
                        <TableCell>{club.contactInfo?.phone || "N/A"}</TableCell>
                        <TableCell>
                          {club.updates.length > 0 ? (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {club.updates.map((update, i) => (
                                <Chip
                                  key={i}
                                  label={update}
                                  color="secondary"
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No updates
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default BrowseClubs;
