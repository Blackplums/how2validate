declare global {
  // This extends the NodeJS global object to have a mongoose connection property
  namespace NodeJS {
    interface Global {
      mongoose: {
        conn: mongoose.Connection | null
        promise: Promise<mongoose.Mongoose> | null
      }
    }
  }
}

export {}
