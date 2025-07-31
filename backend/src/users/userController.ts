import userService from "./userService.js";
import { Request, Response, RequestHandler } from "express";
import { UserUpdateSchemaZod, IUserUpdate } from "./userModel.js";

class UserController {
  public updateUser: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
    const validationResult = UserUpdateSchemaZod.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.format(),
      });
      return;
    }
    try {
      const updatedUser = await userService.updateUser(
        userId,
        validationResult.data as IUserUpdate
      );
      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user in controller:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  };
}
const userController = new UserController();
export default userController;
