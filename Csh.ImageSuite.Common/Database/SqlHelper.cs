using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Transactions;

namespace Csh.ImageSuite.Common.Database
{
    /// <summary>
    /// 
    /// </summary>
    [Serializable]
    public class SqlWrapper
    {
        public SqlWrapper()
        {
            // Default command type
            CommandType = CommandType.Text;
        }

        public SqlWrapper(string sql, SqlParameter[] para)
            : this()
        {
            this.SqlString = sql;
            this.Parameter = para;
        }

        public string SqlString { get; set; }

        public SqlParameter[] Parameter { get; set; }

        public CommandType CommandType { get; set; }
    }

    /// <summary>
    /// The SqlHelper class is intended to encapsulate high performance, 
    /// scalable best practices for common uses of SqlClient.
    /// </summary>
    public abstract class SqlHelper
    {

        #region ========================== Query ==========================

        /// <summary>
        /// 执行一个SQL查询返回一个数据集
        /// </summary>
        /// <param name="queryString">查询语句</param>
        /// <param name="tableName">表名</param>
        /// <param name="connectionString"></param>
        /// <returns>DataSet实体</returns>
        public static DataSet ExecuteAdapter(string queryString, string tableName, string connectionString)
        {
            var dataset = new DataSet();

            try
            {
                using (var conn = new SqlConnection(connectionString))
                {
                    var adapter = new SqlDataAdapter(queryString, conn);
                    adapter.Fill(dataset, tableName);
                }
            }
            catch (SqlException sqlException)
            {
                //GXLogManager.WriteLog(GXLogModule.SQLServerDAL_SqlHelper, GXLogLevel.Fatal, GXLogCode.DEFAULT, sqlException.Message + queryString, "SqlHelper");
                throw sqlException;
            }
            catch
            {
                //GXLogManager.WriteLog(GXLogModule.SQLServerDAL_SqlHelper, GXLogLevel.Error, GXLogCode.DEFAULT, "at Carestream.GXWeb.Server.Utility.SqlHelper.ExecuteAdapter.", "SqlHelper");
                throw;
            }

            return dataset;
        }


        /// <summary>
        /// Query DB by Sql and return the Dataset result
        /// </summary>
        /// <param name="queryString">SQL</param>
        /// <param name="connectionString"></param>
        /// <returns></returns>
        public static DataSet ExecuteQuery(string queryString, string connectionString)
        {
            var sw = new SqlWrapper
            {
                SqlString = queryString,
                Parameter = null
            };
            return ExecuteQuery(sw, connectionString);
        }


        /// <summary>
        /// Query DB by Sql and return the Dataset result
        /// </summary>
        /// <param name="queryString">SQL</param>
        /// <param name="paraList"></param>
        /// <param name="connectionString"></param>
        /// <returns></returns>
        public static DataSet ExecuteQuery(string queryString, SqlParameter[] paraList, string connectionString)
        {
            var sw = new SqlWrapper
            {
                SqlString = queryString,
                Parameter = paraList
            };
            return ExecuteQuery(sw, connectionString);
        }


        /// <summary>
        /// Query DB by Sql and return the Dataset result
        /// </summary>
        /// <param name="sqlWrapper"></param>
        /// <param name="connectionString"></param>
        /// <returns></returns>
        public static DataSet ExecuteQuery(SqlWrapper sqlWrapper, string connectionString)
        {
            var dataset = new DataSet();

            try
            {
                using (var conn = new SqlConnection(connectionString))
                {
                    var dadp = new SqlDataAdapter();
                    var cmd = new SqlCommand(sqlWrapper.SqlString, conn) {CommandType = sqlWrapper.CommandType};
                    if (sqlWrapper.Parameter != null)
                    {
                        foreach (var para in sqlWrapper.Parameter)
                        {
                            para.Value = para.Value ?? DBNull.Value;
                            cmd.Parameters.Add(para);
                        }
                    }
                    dadp.SelectCommand = cmd;
                    dadp.Fill(dataset);
                }
            }
            catch (SqlException sqlException)
            {
                //GXLogManager.WriteLog(GXLogModule.SQLServerDAL_SqlHelper, GXLogLevel.Fatal, GXLogCode.DEFAULT, sqlException.Message + _SqlWrapper.SqlString, "SqlHelper");
                throw sqlException;
            }
            catch (Exception ex)
            {
                //GXLogManager.WriteLog(GXLogModule.SQLServerDAL_SqlHelper, GXLogLevel.Fatal, GXLogCode.DEFAULT, ex.Message + _SqlWrapper.SqlString, "SqlHelper");
                throw ex;
            }
            catch
            {
                //GXLogManager.WriteLog(GXLogModule.SQLServerDAL_SqlHelper, GXLogLevel.Error, GXLogCode.DEFAULT, "at Carestream.GXWeb.Server.Utility.SqlHelper.ExecuteAdapter.", "SqlHelper");
                throw;
            }

            return dataset;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="sqlWrapper"></param>
        /// <param name="connectionString"></param>
        /// <returns></returns>
        public static string GetSingleReturnValue(SqlWrapper sqlWrapper, string connectionString)
        {
            var ds = ExecuteQuery(sqlWrapper, connectionString);
            if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                return ds.Tables[0].Rows[0][0].ToString().Trim();
            }
            return "";
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="queryString"></param>
        /// <param name="connectionString"></param>
        /// <returns></returns>
        public static string GetSingleReturnValue(string queryString, string connectionString)
        {
            var ds = ExecuteQuery(queryString, connectionString);
            if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                return ds.Tables[0].Rows[0][0].ToString().Trim();
            }
            return "";
        }

        #endregion


        #region ========================== Execute ==========================

        /// <summary>
        /// Execute a SQL statement, such as Insert, Update or Delete
        /// </summary>
        /// <param name="strSql"></param>
        /// <param name="connectionString"></param>
        /// <returns></returns>
        public static int ExecuteNonQuery(string strSql, string connectionString)
        {
            return ExecuteNonQuery(strSql, null, connectionString);
        }

        /// <summary>
        /// Execute a SQL statement, such as Insert, Update or Delete
        /// </summary>
        /// <param name="lstSql"></param>
        /// <param name="connectionString"></param>
        /// <returns></returns>
        public static int ExecuteNonQuery(List<string> lstSql, string connectionString)
        {
            var lstSqlWrapper = new List<SqlWrapper>();
            foreach (var sql in lstSql)
            {
                var sw = new SqlWrapper(sql, null);
                lstSqlWrapper.Add(sw);
            }
            return ExecuteNonQuery(lstSqlWrapper, connectionString);
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="strSql"></param>
        /// <param name="paraList"></param>
        /// <param name="connectionString"></param>
        /// <returns></returns>
        public static int ExecuteNonQuery(string strSql, SqlParameter[] paraList, string connectionString)
        {
            var sqlWrapper = new SqlWrapper
            {
                SqlString = strSql,
                Parameter = paraList
            };
            return ExecuteNonQuery(sqlWrapper, connectionString);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="sqlWrapper"></param>
        /// <param name="connectionString"></param>
        /// <returns></returns>
        public static int ExecuteNonQuery(SqlWrapper sqlWrapper, string connectionString)
        {
            try
            {
                using (var conn = new SqlConnection(connectionString))
                {
                    var cmd = new SqlCommand
                    {
                        CommandText = sqlWrapper.SqlString,
                        Connection = conn,
                        CommandType = sqlWrapper.CommandType
                    };

                    conn.Open();
                    if (sqlWrapper.Parameter != null && sqlWrapper.Parameter.Length > 0)
                    {
                        foreach (var para in sqlWrapper.Parameter)
                        {
                            para.Value = para.Value ?? DBNull.Value;
                            cmd.Parameters.Add(para);
                        }
                    }

                    var iret = cmd.ExecuteNonQuery();
                    if (sqlWrapper.Parameter != null && sqlWrapper.Parameter.Length > 0)
                    {
                        foreach (var para in sqlWrapper.Parameter)
                        {
                            if (para.Direction == ParameterDirection.ReturnValue)
                            {
                                iret = Convert.ToInt32(para.Value.ToString());
                            }
                        }
                    }
                    return iret;
                }
            }
            catch (SqlException sqlException)
            {
                //GXLogManager.WriteLog(GXLogModule.SQLServerDAL_SqlHelper, GXLogLevel.Fatal, GXLogCode.DEFAULT, sqlException.Message + SqlWrapper.SqlString, "SqlHelper");
                throw sqlException;
            }
            catch
            {
                //GXLogManager.WriteLog(GXLogModule.SQLServerDAL_SqlHelper, GXLogLevel.Error, GXLogCode.DEFAULT, "at Carestream.GXWeb.Server.Utility.SqlHelper.ExecuteAdapter.", "SqlHelper");
                throw;
            }
        }

        /// <summary>
        /// Execute a SQL statement, such as Insert, Update or Delete
        /// </summary>
        /// <param name="lstSql"></param>
        /// <param name="connectionString"></param>
        /// <returns></returns>
        public static int ExecuteNonQuery(List<SqlWrapper> lstSql, string connectionString)
        {
            try
            {
                var iRet = 0;

                using (var scope = new TransactionScope())
                {
                    using (var conn = new SqlConnection(connectionString))
                    {
                        var cmd = new SqlCommand {Connection = conn};
                        conn.Open();

                        foreach (var sql in lstSql)
                        {
                            try
                            {
                                cmd.CommandText = sql.SqlString;
                                cmd.CommandType = sql.CommandType;
                                cmd.Parameters.Clear();

                                if (sql.Parameter != null)
                                {
                                    foreach (var para in sql.Parameter)
                                    {
                                        para.Value = para.Value ?? DBNull.Value;
                                        cmd.Parameters.Add(para);
                                    }
                                }
                                iRet += cmd.ExecuteNonQuery();
                            }
                            catch (SqlException sqlException)
                            {
                                //GXLogManager.WriteLog(GXLogModule.SQLServerDAL_SqlHelper, GXLogLevel.Fatal, GXLogCode.DEFAULT, sqlException.Message + sql.SqlString, "SqlHelper");
                                throw sqlException;
                            }
                            catch
                            {
                                //GXLogManager.WriteLog(GXLogModule.SQLServerDAL_SqlHelper, GXLogLevel.Error, GXLogCode.DEFAULT, "at Carestream.GXWeb.Server.Utility.SqlHelper.ExecuteAdapter.", "SqlHelper");
                                throw;
                            }
                        }
                    }
                    scope.Complete();
                    return iRet;
                }
            }
            catch
            {
                throw;
            }
        }

        #endregion

    }
}
