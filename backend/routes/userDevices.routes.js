import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js'; // Uncomment this line to enable authentication for item routes

import {
getDevicesForUser, 
deleteDevice,
saveDevice, 
refreshDevice
}
from '../services/UserDevices.service.js';

const router = express.Router();
router.use(requireAuth); // Apply authentication middleware to all device routes

/** 
 * Register / Update a device for a user
 * 
 * Called:
 * -when app starts on a device to register it for the user
 * -when user logs in on a new device to add it to their account
 * -when user refreshes the app to update the last active time and TTL
 */

router.post(
    "/", 

    async (req, res) => {
        try {
            const userId = req.user.sub; // Use the authenticated user's ID

            const { deviceId, fcmToken, deviceType } = req.body;
            if (!deviceId || !fcmToken) {
                return res.status(400).json({ 
                    error: "Missing required fields" 
                });
            }
            //Basic validation to ensure deviceId and fcmToken are strings
            if (typeof deviceId !== "string" || typeof fcmToken !== "string") {
                return res.status(400).json({
                    error: "deviceId and fcmToken must be strings"
                });
            }
            //Save or update the device information in the database
            const device = await saveDevice({
                userId, 
                deviceId,
                fcmToken,
                deviceType
            });
            //Return the saved device information in the response
            return res.json({
                success: true,
                data: device
            });
            //Error handling
        }  catch (err) {
            console.error("Error saving device:", err);

            return res.status(500).json({ 
                error: "Failed to save device" 
            });
        }
    }    
);

/**
 * GET USER DEVICES
 * 
 */
router.get(
    "/",
    async (req, res) => {
        try {
            const userId = req.user.sub; // Use the authenticated user's ID
            //devices for the user from the database
            const devices  = await getDevicesForUser(userId);
            return res.json({
                success: true,
                data: devices
            });
            //error handling
        } catch (err) {
            console.error("Error fetching devices:", err);
            return res.status(500).json({
                error: "Failed to fetch devices"
            });
        }
    }
);

/**
 * Delete a device (e.g. when user logs out from a device)
 * 
 */
router.delete(
    "/:deviceId",
    async (req, res) => {
        try {
            const userId = req.user.sub; // Use the authenticated user's ID
            const { deviceId } = req.params;

            await deleteDevice(userId, deviceId);

            return res.json({
                success: true,

            });
        } catch (err) {
            console.error("Error deleting device:", err);
            return res.status(500).json({
                error: "Failed to delete device"
            });
        }
    }
);

/**
 * Refresh device activity (e.g. when user opens the app to update last active time and TTL)
 *  
 */
router.put(
    "/:deviceId/refresh",
    async (req, res) => {
        try {
            const userId = req.user.sub; // Use the authenticated user's ID
            const { deviceId } = req.params;

            // Refresh the device's last active time and TTL in the database
            await refreshDevice(userId, deviceId);

            return res.json({
                success: true,
            });
        } catch (err) {
            console.error("Error refreshing device:", err);
            return res.status(500).json({
                error: "Failed to refresh device"
            });
        }                  
    }
);

export default router;
