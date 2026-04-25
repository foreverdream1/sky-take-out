package com.sky.service;

import com.sky.vo.OrderReportVO;
import com.sky.vo.SalesTop10ReportVO;
import com.sky.vo.TurnoverReportVO;
import com.sky.vo.UserReportVO;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface ReportService {

    /**
     * 营业额统计
     * @param start
     * @param end
     * @return
     */
    TurnoverReportVO turnoverStatistics(LocalDate start, LocalDate end);

    /**
     * 统计用户数据
     * @param start
     * @param end
     * @return
     */
    UserReportVO userStatistics(LocalDate start, LocalDate end);

    /**
     * 订单统计
     * @param start
     * @param end
     * @return
     */
    OrderReportVO ordersStatistics(LocalDate start, LocalDate end);

    /**
     * 销量排名top10
     * @param start
     * @param end
     * @return
     */
    SalesTop10ReportVO salesTop10(LocalDate start, LocalDate end);
}
