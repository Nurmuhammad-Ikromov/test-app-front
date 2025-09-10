import { useEffect, useState } from "react";
import {
  Avatar,
  TextField,
  Skeleton,
  Button,
  Typography,
  Modal,
  Box,
} from "@mui/material";
import { MdEdit } from "react-icons/md";
import API from "../../utils/config";
import User from "../../assets/user.svg";

const ProfileData = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("userData");
    return saved ? JSON.parse(saved) : null;
  });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(!userData);
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem("profileImage") || User;
  });

  useEffect(() => {
    if (!userData) fetchUserData();
  }, [userData]);

  const fetchUserData = async () => {
    try {
      const res = await API.get("auth/profile");
      const user = res.data.user;
      setUserData(user);
      localStorage.setItem("userData", JSON.stringify(user));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      localStorage.setItem("profileImage", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const isPasswordValid = (pwd) =>
    pwd.trim().length >= 8 && pwd.trim().length <= 12;

  const updatePassword = async () => {
    if (!isPasswordValid(password)) {
      alert("Parol 8-12 ta belgi orasida bo‘lishi kerak");
      return;
    }

    try {
      await API.put("/students/update-password", { password });
      alert("Parol muvaffaqqiyatli yangilandi");
      setPassword("");
    } catch (err) {
      console.error(err);
    }
  };

  const renderSkeleton = () => (
    <Skeleton
      variant="rectangular"
      height={56}
      width="100%"
      sx={{ margin: "15px 0" }}
    />
  );

  const renderTextField = (label, value, isPassword = false, onChange = null) => (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      value={value}
      disabled={!isPassword}
      onChange={onChange}
      sx={{ margin: "15px 0" }}
    />
  );

  return (
    <div className="profile overflow-y-auto h-[80vh]">
      <div className="relative inline-block mb-5">
        {loading ? (
          <Skeleton
            variant="circular"
            width={200}
            height={200}
            className="mx-auto"
          />
        ) : (
          <Avatar
            onClick={() => setIsModalOpen(true)}
            className="object-cover absolute inset-2/4 -translate-x-2/4 cursor-pointer"
            sx={{ width: 200, height: 200 }}
            src={profileImage}
          />
        )}
        <label htmlFor="user-photo">
          <MdEdit className="absolute right-0 top-0 cursor-pointer size-8 bg-slate-200 rounded p-1" />
        </label>
        <input
          type="file"
          id="user-photo"
          hidden
          onChange={handleImageUpload}
        />

        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 2,
              outline: "none",
              borderRadius: 2,
            }}
          >
            <img
              src={profileImage}
              alt="Profile"
              style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
            />
          </Box>
        </Modal>
      </div>

      {loading
        ? renderSkeleton()
        : renderTextField("Ism", userData?.user.first_name)}

      {loading
        ? renderSkeleton()
        : renderTextField("Surname", userData?.user.last_name)}

      {loading
        ? renderSkeleton()
        : renderTextField("User-Name", userData?.user.username)}

      {loading ? (
        renderSkeleton()
      ) : (
        <>
          {renderTextField("Password", password, true, handlePasswordChange)}
          <Typography variant="caption" color="warning.main">
            Parol 8–12 ta belgidan iborat bo‘lishi kerak
          </Typography>
        </>
      )}

      {loading
        ? renderSkeleton()
        : renderTextField("Class", userData?.user.class?.name)}

      <Button variant="outlined" color="primary" onClick={updatePassword}>
        Saqlash
      </Button>
    </div>
  );
};

export default ProfileData;
