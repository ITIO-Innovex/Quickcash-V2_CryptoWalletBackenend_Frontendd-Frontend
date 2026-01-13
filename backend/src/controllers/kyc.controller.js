const fs = require('fs');
const path = require('path');
const ejs = require("ejs");
const {Coin} = require("../models/Admin/coin.model");                   
const { mongoose} = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { Kyc } = require('../models/kyc.model');
const { User } = require("../models/user.model");
const { sendMail } = require('../middlewares/mail.middleware');
const { addNotification } = require("../middlewares/notification.middleware");
const FireblocksSDK = require('fireblocks-sdk').FireblocksSDK;
const baseUrl = "https://sandbox-api.fireblocks.io";
const apiSecret = fs.readFileSync(path.resolve("fireblocks_secret6.key"), "utf8");
const { WalletAddressRequest } = require('../models/walletAddressRequest.model');
let fireblocks = new FireblocksSDK(apiSecret, process.env.FIREBLOCKS_API_KEY, baseUrl);

module.exports = {
  // This function is used for add/insert/save kyc data
  addKyc: async(req,res) => {
    console.log("Add KYC Data :", req.body);
    const {user,email,primaryPhoneNumber,secondaryPhoneNumber,documentType,documentNumber,addressDocumentType,status, dob, gender} = req.body;
      try {
        if(user == "" || email == "" || primaryPhoneNumber == "" || documentType == "" || dob =="" || gender == "") {
          return res.status(401).json({
            status: 401,
            message: "All fields are mandatory",
            data: null
          })
        }

        let Image1  = '';
        let Image2 = '';
        let Image3 = '';

        if(req.files.documentPhotoFront) {
          Image1 = req.files.documentPhotoFront[0].filename;
        }
        if(req.files.documentPhotoBack) {
          Image2 = req.files.documentPhotoBack[0].filename;
        }
        if(req.files.addressProofPhoto) {
          Image3 = req.files.addressProofPhoto[0].filename;
        }

        const kyc = await Kyc.create({
          user,
          email,
          primaryPhoneNumber,
          secondaryPhoneNumber,
          documentType,
          documentNumber,
          addressDocumentType,
          documentPhotoFront:Image1,
          documentPhotoBack:Image2,
          addressProofPhoto:Image3,
          status: "pending"
        });
        
        const ObjectId = mongoose.Types.ObjectId;

        await User.findByIdAndUpdate(
        {
          _id: new ObjectId(user)
        },
        {
          dob,
          gender,
          ownerbrd:Image1,
          owneridofindividual:documentType,
          ownertaxid: documentNumber,
          mobile: primaryPhoneNumber
        },
        {
          new: true,
        });
    
        if(!kyc) {
          return res.status(401).json({
            status: 401,
            message: "Error while inserting or inserting Kyc data",
            data: null
          })
        }
                 
        return res.status(200).json({
          status: 201,
          message: "Kyc Updated !!!",
          data:kyc
        })

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error
      })
    }
  },
  // This function is used for fetching kyc data by their kyc id
getkycData: async (req, res) => {
  const user_id = req.params.id;
  const ObjectId = mongoose.Types.ObjectId;

  try {
    if (!user_id) {
      return res.status(402).json({
        status: 402,
        message: "User Id is missing",
        data: null
      });
    }

    // Perform aggregation to fetch KYC data and join with the users collection
    const listDetails = await Kyc.aggregate([
      {
        $match: { user: new ObjectId(user_id) } // Match KYC by user ID
      },
      {
        $lookup: {
          from: "users", // 'users' collection name
          localField: "user", // field in KYC collection
          foreignField: "_id", // field in Users collection
          as: "userDetails" // alias to store user data
        }
      },
      {
        $unwind: {
          path: "$userDetails", // Unwind the userDetails array
          preserveNullAndEmptyArrays: true // Preserve the data even if no match is found
        }
      },
      {
        $project: {
          _id: 1,
          email: 1,
          primaryPhoneNumber: 1,
          secondaryPhoneNumber: 1,
          documentType: 1,
          documentNumber: 1,
          addressDocumentType: 1,
          documentPhotoFront: 1,
          documentPhotoBack: 1,
          addressProofPhoto: 1,
          status: 1,
          emailVerified:1,
          phonePVerified:1,
          phoneSVerified:1,
          userDetails: {
            dob: 1, // Include dob from userDetails
            gender: 1 // Include gender from userDetails
          }
        }
      }
    ]);

    if (!listDetails || listDetails.length === 0) {
      return res.status(402).json({
        status: 402,
        message: "Error while fetching kyc data!!!",
        data: null,
      });
    }

    return res.status(201).json({
      status: 201,
      message: "KYC data fetched successfully",
      data: listDetails,
    });

  } catch (error) {
    console.log("Error fetching KYC data:", error);
    return res.status(500).json({
      status: 500,
      message: "Error while fetching kyc data!!!",
      data: error
    });
  }
},
  // This function is used for fetching data (for admin)
  getAdminkycData: async(req,res) => {
      
    const user_id = req.params.id; 
    const ObjectId = mongoose.Types.ObjectId;

    try {
      if(!user_id) {
      return res.status(402).json({
        status: 402,
        message: "User Id is missing",
        data: null
      });
    }

    // const listDetails = await Kyc.find({
    //   _id: new ObjectId(user_id)
    // })

      const listDetails = await Kyc.aggregate([
      {
        $match: { user: new ObjectId(user_id) }
      },
      {
        $lookup: {
          from: 'users', // 'users' is the name of the User collection
          localField: 'user', // field in the KYC collection
          foreignField: '_id', // field in the User collection
          as: 'userDetails' // alias for the joined data
        }
      },
      {
        $unwind: {
          path: '$userDetails', // Unwind the userDetails array (as only one user will match)
          preserveNullAndEmptyArrays: true // Preserve the data even if no match is found
        }
      },
      {
        $project: {
          _id: 1,
          email: 1,
          primaryPhoneNumber: 1,
          secondaryPhoneNumber: 1,
          documentType: 1,
          documentNumber: 1,
          addressDocumentType: 1,
          documentPhotoFront: 1,
          documentPhotoBack: 1,
          addressProofPhoto: 1,
          status: 1,
          dob: '$userDetails.dob',
          gender: '$userDetails.gender'
        }
      }
    ]);

    if(!listDetails || listDetails.length === 0) {
      return res.status(402).json({
        status: 402,
        message: "Error while fetching kyc data!!!",
        data: null,
      });
    }
 
    return res.status(201).json({
      status:201,
      message: "kyc data are fetched Successfully",
      data: listDetails,
    });

  } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching kyc data!!!",
        data: error
      });
    }
  },
  // This function is used for update kyc data
  updateKycData: async(req,res) => {
    // console.log("Update KYC Data Request:", req.body);
    const {user,email,primaryPhoneNumber,secondaryPhoneNumber,documentType,documentNumber,addressDocumentType,status,dob, gender} = req.body;
      try {
        if(user == "" || email == "" || primaryPhoneNumber == "" || documentType == "") {
          return res.status(401).json({
            status: 401,
            message: "All fields are mandatory",
            data: null
          })
        }

        let Image1  = '';
        let Image2 = '';
        let Image3 = '';

        if(req.files?.documentPhotoFront) {
          Image1 = req.files.documentPhotoFront[0].filename;
        }
        if(req.files?.documentPhotoBack) {
          Image2 = req.files.documentPhotoBack[0].filename;
        }
        if(req.files?.addressProofPhoto) {
          Image3 = req.files.addressProofPhoto[0].filename;
        }

        const ObjectId = mongoose.Types.ObjectId;

        if(Image1) {
          await Kyc.findByIdAndUpdate(
          {
            _id:req.params.id
          },
          {
            documentPhotoFront:Image1
          },
          {
            new: true,
          });

          await User.findByIdAndUpdate(
          {
            _id: new ObjectId(user)
          },
          {
            ownerbrd:Image1,
          },
          {
            new: true,
          });
        }

        if(Image2) {
          await Kyc.findByIdAndUpdate(
          {
            _id:req.params.id
          },
          {
            documentPhotoBack:Image2
          },
          {
            new: true,
          })
        }

        if(Image3) {
          await Kyc.findByIdAndUpdate(
          {
            _id:req.params.id
          },
          {
            addressProofPhoto:Image3
          },
          {
            new: true,
          })
        }
        
        const Updatekyc = await Kyc.findByIdAndUpdate(
        {
          _id:req.params.id
        },
        {
          user,
          email,
          primaryPhoneNumber,
          secondaryPhoneNumber,
          documentType,
          documentNumber,
          addressDocumentType,
          status
        },
        {
          new: true,
        })

        await User.findByIdAndUpdate(
        {
          _id: new ObjectId(user)
        },
        {
          dob,
          gender,
          owneridofindividual:documentType,
          ownertaxid: documentNumber,
          mobile: primaryPhoneNumber
        },
        {
          new: true,
        });
  
        if(!Updatekyc) {
          return res.status(401).json({
            status:401,
            message: "Error while updating kyc data!",
            data:null
          });
        }

        await addNotification(user,title=`Kyc data has been submitted by the ${req?.user?.name} `,tags=`KYC, ${req?.user?.name}`,message="KYC info has been submitted",notifyFrom="user",notifyType="kyc",attachment="",info=`${req?.user?.name} User has been submitted kyc details`);
                 
        return res.status(200).json({
          status: 201,
          message: "Kyc Updated !!!",
          data:Updatekyc
        });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error
      });
    }
  },
  // This function is used for update kyc status
  updatekycRequestStatus : async (req, res) => {
    
      const { status, comment } = req.body;
      
      try {
        const kyc_id = req.params.id;
        
        if (!kyc_id) {
          console.log("❌ KYC ID is missing!");
          return res.status(401).json({
            status: 401,
            message: "KYC ID is missing",
            data: null,
          });
        }
    
        if (!status) {
          console.log("❌ Status is missing!");
          return res.status(401).json({
            status: 401,
            message: "Status is missing",
            data: null,
          });
        }
    
        // Find KYC User
        const getUserId = await Kyc.findById({ _id: kyc_id });
    
        if (!getUserId) {
          console.log("❌ User doesn't exist!");
          return res.status(401).json({
            status: 401,
            message: "User doesn't exist",
            data: null,
          });
        }
    
        //  Fetch User Details
        const userInfo = await User.findOne({ _id: getUserId?.user });
    
        // Update KYC Data
        const UpdateData = await Kyc.findByIdAndUpdate(
          { _id: kyc_id },
          { status, comment: comment ? comment : "" },
          { new: true }
        );
    
        if (!UpdateData) {
          console.log("❌ Error while updating KYC request!");
          return res.status(401).json({
            status: 401,
            message: "Error while updating KYC request!",
            data: null,
          });
        }

          const defaultCoin = await Coin.findOne({ isDefault: true });
          console.log('found default coin', defaultCoin);
          if (!defaultCoin) {
            console.log("❌ No default coin found!");
            return res.status(400).json({
              status: 400,
              message: "No default coin is set",
              data: null,
            });
          }
        
          let addressData = "";
          const coin = `${defaultCoin.coin}_TEST`; 
          console.log('coin name',coin);
        if (userInfo?.vaultAccountId) {
          console.log("✅ Vault Account Found:", userInfo.vaultAccountId);
          addressData = await generateAndSaveWalletAddress(
            userInfo._id,
            coin,
            parseInt(userInfo.vaultAccountId)
          );
        } else {
          console.log(" No Vault Account Found, Creating New Vault Account...");
          const newVaultId = await createVaultAccount(userInfo?.email);
    
          if (newVaultId) {
            console.log(" Vault Account Created:", newVaultId);
            
            //  Save new Vault ID in User collection
            await User.updateOne({ _id: userInfo._id }, { vaultAccountId: newVaultId });
    
            //  Generate & Save Wallet Address
            addressData = await generateAndSaveWalletAddress(
              userInfo._id,
              coin,
              parseInt(newVaultId)
            );
          } else {
            console.log("❌ Failed to create a new Vault Account!");
          }
        }
    
        if (addressData) {
          console.log("🚀 Saving Wallet Address in walletaddressrequests Collection...");
    
          // Check if user already has a wallet for this coin
          const existingWallet = await WalletAddressRequest.findOne({
            user: userInfo._id,
            coin: coin,
          });
    
          if (!existingWallet) {
            //  Create a new wallet entry
            await WalletAddressRequest.create({
              user: userInfo._id,
              coin: coin,
              noOfCoins: "0.0000000",
              walletAddress: addressData,
              status: "completed",
            });
            console.log("✅ New wallet entry saved.");
          } else {
            //  Update existing wallet address
            await WalletAddressRequest.findOneAndUpdate(
              { user: userInfo._id, coin: coin },
              { walletAddress: addressData },
              { new: true }
            );
            console.log("✅ Existing wallet entry updated.");
          }
        }
    
        //  Send Email Notification
        const name = userInfo?.name;
        const email = userInfo?.email;
        const htmlBody = await ejs.renderFile(
          __dirname.replace("\\controllers", "") + "/views/KycUpdate.ejs",
          { name, status, comment }
        );
    
        if (htmlBody) {
          const subject = "KYC Update !!!";
          sendMail(email, subject, htmlBody);
        }
    
        console.log(" [SUCCESS] KYC Request Updated & Wallet Address Handled");
    
        return res.status(201).json({
          status: 201,
          data: UpdateData,
          message: "KYC data has been updated successfully",
        });
    
      } catch (error) {
        console.error("❌ Error in updatekycRequestStatus:", error);
        return res.status(500).json({
          status: 500,
          message: "Something went wrong with API",
          data: error,
        });
      }
    },  
  // This function is used for fetching kyc list
  list: async(req,res) => {
      
   try {
    const title = req.query.status || '';
    var searchItem = '';

    if(title == "not_submitted") {
      searchItem = 'not_submitted';
    } else if(title == "") {
      searchItem = '';
    } else if(title == "pending") {
      searchItem = 'Pending';
    } else if(title == "completed") {
      searchItem = 'completed';
    } else {
      searchItem = '';
    }

    if(searchItem == "not_submitted") {
      var listDetails = await Kyc.aggregate([
        {
          $match: {
            documentPhotoFront: ''
          }
        },
        {
          $lookup: {
            "from": "users",
            "localField": "user",
            "foreignField": "_id",
            "as": "userDetails"
          }
        },
        {$sort: {createdAt: -1}},
        {
          $project: {
          _id:1,
          user:1,
          email:1,
          primaryPhoneNumber:1,
          secondaryPhoneNumber:1,
          documentType:1,
          documentNumber:1,
          documentPhotoFront:1,
          documentPhotoBack:1,
          addressDocumentType:1,
          addressProofPhoto:1,
          status:1,
          createdAt:1,
          userDetails: {
          _id: 1,
          name: 1,
          email: 1,
          mobile: 1,      
          address: 1,
          city: 1,
          country: 1,
          defaultCurrency: 1,
          status:1,
          dob: 1,
          gender: 1
        }
       }
      },
      ])
    } else {
      var listDetails = await Kyc.aggregate([
        {
          $match: {
            status: {'$regex': searchItem, '$options' : 'i'}
          }
        },
        {
          $lookup: {
            "from": "users",
            "localField": "user",
            "foreignField": "_id",
            "as": "userDetails"
          }
        },
        {$sort: {createdAt: -1}},
        {
          $project: {
          _id:1,
          user:1,
          email:1,
          primaryPhoneNumber:1,
          secondaryPhoneNumber:1,
          documentType:1,
          documentNumber:1,
          documentPhotoFront:1,
          documentPhotoBack:1,
          addressDocumentType:1,
          addressProofPhoto:1,
          status:1,
          createdAt:1,
          userDetails: {
          _id: 1,
          name: 1,
          email: 1,
          mobile: 1,      
          address: 1,
          city: 1,
          country: 1,
          defaultCurrency: 1,
          status:1,
          dob: 1,
          gender: 1
        }
       }
      },
      ])
    }
 if(!listDetails) {
  return res.status(402).json({
    status: 402,
    message: "Error while fetching kyc list!!!",
    data: null,
  });
 }
 
 return res.status(201).json({
  status:201,
  message: "kyc data list are fetched Successfully",
  data: listDetails,
 });

} catch (error) {
  console.log(error);
  return res.status(500).json({
    status: 500,
    message: "Error while fetching kyc data!!!",
    data: error
  });
 }
  },
  updateHistory: async(req,res) => {

  try {
   const id = req.params.id;
   if(!id) {
    return res.status(401).json({
     status: 401,
     message: "kyc id is missing",
     data: null
    });
  }

  const details = await Kyc.find({_id:id});

  if(!details) {
    return  res.status(401).json({
     status:401,
     message: "Error while fetching history!",
     data:null
    });
  }
  
  return res.status(201).json({
    status:201,
    data:details[0].history,
    message: "History has been fetched successfully"
  });

 } catch (error) {
    console.log(error);
    return res.status(500).json({
      status:500,
      data:details,
      message: "error"
    });
  }
  },
  verify: async(req,res) => {

    const {user,email,primaryPhoneNumber,secondaryPhoneNumber,emailVerified,phonePVerified,phoneSVerified,type} = req.body;

    try {

      if(user == "" || type == "") {
        return res.status(401).json({
          status: 401,
          message: "Verify type is missing",
          data: null
        });
      }

      const ObjectId = mongoose.Types.ObjectId;

      const Updatekyc = await Kyc.findByIdAndUpdate(
      {
        _id:new ObjectId(req.params.id)
      },
      {
        user,
        email,
        primaryPhoneNumber,
        secondaryPhoneNumber,
        emailVerified,
        phonePVerified,
        phoneSVerified
      },
      {
        new: true,
      })
  
      if(!Updatekyc) {
        return  res.status(401).json({
          status:401,
          message: "Error while updating kyc data!",
          data:null
        })
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Verified Successfully",
        data:Updatekyc
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error
      });
    }
  },
  getKycStatus: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const kycRecord = await Kyc.findOne({ user: userId });
      if (!kycRecord) {
        return res.status(404).json({ message: "KYC record not found" });
      }

      // 🔍 Check if KYC is truly filled
      const isKycFilled = [
        kycRecord.documentType,
        kycRecord.documentNumber,
        kycRecord.addressDocumentType,
        kycRecord.documentPhotoFront,
        kycRecord.documentPhotoBack,
        kycRecord.addressProofPhoto,
      ].every(field => field && field !== '');

      return res.status(200).json({
        status: kycRecord.status,
        isKycFilled,
      });
      
    } catch (error) {
      console.error("Error while fetching KYC status:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  }

async function getWalletAddress(user, vaultAccountId, assetId) {
  try {
    const ObjectId = mongoose.Types.ObjectId;
    const myNewVault = await fireblocks.getPaginatedAddresses(
      vaultAccountId,
      assetId
    );
    if (myNewVault?.addresses) {
      if (myNewVault?.addresses?.length > 0) {
        const walletUpdate = await WalletAddressRequest.findOneAndUpdate(
          {
            user: new ObjectId(user),
            coin: assetId,
          },
          {
            walletAddress: myNewVault?.addresses?.[0]?.address,
          },
          {
            new: true,
          }
        );

        if (!walletUpdate) {
          const wallet = await WalletAddressRequest.create({
            user,
            coin: assetId,
            noOfCoins: "0.0000000",
            walletAddress: myNewVault?.addresses?.[0]?.address,
            status: "completed",
          });
        }
        return myNewVault?.addresses?.[0]?.address;
      } else {
        const vaultAccount = await fireblocks.generateNewAddress(
          vaultAccountId,
          assetId
        );
        return vaultAccount?.address;
      }
    }
  } catch (error) {
    console.log("Get Address error ", error.response.data.message);
  }
}
// 🔥 Vault Account Create
async function createVaultAccount(email) {
  try {

    // Fireblocks API Call (Vault Account Create)
    const vaultAccount = await fireblocks.createVaultAccount(
      email,
      false,
      "",
      false
    );
    console.log(
      " Vault Account Response:",
      JSON.stringify(vaultAccount, null, 2)
    );

    if (!vaultAccount || !vaultAccount.id) {
      throw new Error(
        "❌ Failed to create vault account: No vault ID returned."
      );
    }
     return vaultAccount.id;
  } catch (error) {
    console.error(
      " Error in createVaultAccount:",
      error?.response?.data || error.message
    );
    return null;
  }
}

const createVaultWalletAddress = async (userid, assetId, vaultAccountId) => {
  try {

    let walletAddress = "";

    try {
      const vaultAccount = await fireblocks.createVaultAsset(
        vaultAccountId,
        assetId
      );
      walletAddress = vaultAccount?.address || "";
    } catch (error) {
      if (error?.response?.data?.code === 1026) {
        //  If Asset Already Exists
        walletAddress = await fetchWalletAddressFromVault(
          vaultAccountId,
          assetId
        );
      } else {
        console.error(
          " Error creating vault asset:",
          error?.response?.data || error
        );
        return "Asset is deprecated. Use a different asset.";
      }
    }

    // If no wallet address found, return error
    if (!walletAddress) {
      return "Asset is deprecated. Use a different asset.";
    }

    // **Remove Prefix (bchtest:) and Keep Only Address**
    walletAddress = walletAddress.includes(":")
      ? walletAddress.split(":")[1]
      : walletAddress;
    walletAddress = walletAddress.trim();

    const existsCoinAddress = await WalletAddressRequest.findOne({
      user: new ObjectId(userid),
      coin: assetId,
    });

    if (!existsCoinAddress) {
      await WalletAddressRequest.create({
        user: new ObjectId(userid),
        coin: assetId,
        noOfCoins: "0.0000000",
        walletAddress: walletAddress,
        status: "completed",
      });
    } else {
      await WalletAddressRequest.findOneAndUpdate(
        { user: new ObjectId(userid), coin: assetId },
        { walletAddress: walletAddress },
        { new: true }
      );
    }

    return walletAddress;
  } catch (error) {
    console.error(
      "❌ Error in createVaultWalletAddress:",
      error?.response?.data || error
    );
    return "Something went wrong.";
  }
};

const fetchWalletAddressFromVault = async (vaultAccountId, assetId) => {
  try {
    // console.log(
    //   ` Fetching wallet address for asset ${assetId} in vault ${vaultAccountId}...`
    // );

    //  Correct API call for fetching deposit addresses
    const depositAddresses = await fireblocks.getDepositAddresses(
      vaultAccountId,
      assetId
    );

    // console.log(
    //   " Full Deposit Addresses Response:",
    //   JSON.stringify(depositAddresses, null, 2)
    // );

    if (!depositAddresses || depositAddresses.length === 0) {
      console.warn(" No deposit addresses found!");
      return null;
    }

    //  Extract first deposit address
    const walletAddress = depositAddresses[0]?.address || null;

    if (!walletAddress) {
      console.warn(" No wallet address found in deposit addresses response.");
      return null;
    }

    return walletAddress;
  } catch (error) {
    console.error(
      " Error fetching wallet address:",
      error?.response?.data || error
    );
    return null;
  }
};

const newVaultWalletAddress = async (userId, assetId, vaultAccountId) =>{
  try {
    // console.log(" Request to generate a new wallet address:", { userId, assetId, vaultAccountId });

    // ✅ Generate a new wallet address using Fireblocks
    const vaultAccount = await fireblocks.generateNewAddress(vaultAccountId, assetId);
    // console.log(" Fireblocks Response:", vaultAccount);

    if (!vaultAccount?.address) {
      console.log(" Failed to generate wallet address.");
      return null;
    }

    //  Remove prefix before saving to DB
    const walletAddress = vaultAccount.address.replace(/^[^:]+:/, "");  
    // console.log(" Cleaned Wallet Address:", walletAddress);

    // Check if the user already has a wallet for this coin
    const ObjectId = mongoose.Types.ObjectId;
    const existingWallet = await WalletAddressRequest.findOne({ user: new ObjectId(userId), coin: assetId });

    if (!existingWallet) {
      // 🆕 First-time wallet creation
      await WalletAddressRequest.create({
        user: new ObjectId(userId),
        coin: assetId,
        noOfCoins: "0.0000000",
        walletAddress, // Save cleaned address
        status: "completed",
      });
      // console.log(" New wallet entry saved to the database.");
    } else {
      // 🔄 Update existing wallet address
      await WalletAddressRequest.findOneAndUpdate(
        { user: new ObjectId(userId), coin: assetId },
        { walletAddress }, // Save cleaned address
        { new: true }
      );
      // console.log("Existing wallet entry updated in the database.");
    }

    return walletAddress;

  } catch (error) {
    console.error(" Error in newVaultWalletAddress:", error?.response?.data || error.message);
    return null;
  }
};

const generateAndSaveWalletAddress = async (userId, assetId, vaultAccountId) => {
  try {
    console.log("🚀 Generating Wallet Address...");
    
    // ✅ Generate a new wallet address
    let walletAddress = await createVaultWalletAddress(userId, assetId, vaultAccountId);
    
    if (!walletAddress) {
      console.log("❌ Failed to generate wallet address!");
      return null;
    }

    console.log("✅ Wallet Address Generated:", walletAddress);

    // ✅ Check if user already has a wallet for this coin
    const existingWallet = await WalletAddressRequest.findOne({
      user: userId,
      coin: assetId,
    });

    if (!existingWallet) {
      // 🆕 First-time wallet creation
      await WalletAddressRequest.create({
        user: userId,
        coin: assetId,
        noOfCoins: "0.0000000",
        walletAddress,
        status: "completed",
      });
      console.log("✅ New wallet entry saved.");
    } else {
      // 🔄 Update existing wallet address
      await WalletAddressRequest.findOneAndUpdate(
        { user: userId, coin: assetId },
        { walletAddress },
        { new: true }
      );
      console.log("✅ Existing wallet entry updated.");
    }

    return walletAddress;

  } catch (error) {
    console.error("❌ Error in generateAndSaveWalletAddress:", error);
    return null;
  }
};
