import React, { useEffect, useState } from "react";
import { db, collection, getDocs, query, where } from "../../config/firebaseConfig";
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const MyClubs = () => {
  const [myClubs, setMyClubs] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchMyClubs();
  }, []);

  const fetchMyClubs = async () => {
    const q = query(collection(db, "registered_clubs"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const clubIds = querySnapshot.docs.map((doc) => doc.data().clubId);

    const clubsList = [];
    for (let clubId of clubIds) {
      const clubQuery = await getDocs(query(collection(db, "clubs"), where("__name__", "==", clubId)));
      clubsList.push(...clubQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    setMyClubs(clubsList);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>My Clubs</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {myClubs.map((club) => (
            <TableRow key={club.id}>
              <TableCell>{club.name}</TableCell>
              <TableCell>{club.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default MyClubs;
