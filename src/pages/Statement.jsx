const Statement = () => {
  return (
    <div className="page">
      <h1>Statement of Originality</h1>
      <p className="text-block">
        I declare that all the work presented in this project is my own original
        creation, except where I have explicitly acknowledged the use of
        external sources. I have not copied or closely paraphrased any part of
        this project from any other source without proper citation. I have also
        not submitted this work, in whole or in part, for credit in any other
        course or institution. I understand that any violation of this statement
        may result in academic penalties, including but not limited to failure
        of the assignment or course.
        <br />
        <br />
        All the Blender models were painstakingly created by me, and the code
        was written from scratch using my own implementation. While I drew some
        structural inspirations from a similar 3D gallery project (referenced in
        the{" "}
        <a className="link" href="/references">
          References
        </a>{" "}
        section), all the code was written independently to suit the specific
        needs of this project. I have cited any external resources and tutorials
        I referenced in the{" "}
        <a className="link" href="/references">
          References
        </a>{" "}
        section of this project.
      </p>
    </div>
  );
};

export default Statement;
